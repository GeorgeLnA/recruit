import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Review = {
  id?: string;
  authorName: string;
  authorTitle?: string;
  company?: string;
  avatarUrl?: string;
  quote: string;
  sourceUrl?: string; // e.g., LinkedIn post/profile
};

interface ReviewMarqueeProps {
  reviews: Review[];
  speedSeconds?: number; // total time for one loop
  pauseOnHover?: boolean;
  className?: string;
  rows?: 1 | 2;
}

export default function ReviewMarquee({
  reviews,
  speedSeconds = 40,
  pauseOnHover = true,
  className = "",
  rows = 2,
}: ReviewMarqueeProps) {
  const safeReviews = Array.isArray(reviews) ? reviews.filter(Boolean) : [];
  if (safeReviews.length === 0) return null;

  // Rows configuration
  const firstRow = safeReviews;
  const secondRow = useMemo(() => [...safeReviews].reverse(), [safeReviews]);

  return (
    <div className={cn(rows === 2 ? "space-y-8" : undefined, className)}>
      <MarqueeRow
        items={firstRow}
        speedSeconds={speedSeconds}
        direction="left"
        pauseOnHover={pauseOnHover}
      />
      {rows === 2 && (
        <MarqueeRow
          items={secondRow}
          speedSeconds={Math.max(24, speedSeconds - 6)}
          direction="right"
          pauseOnHover={pauseOnHover}
        />
      )}
    </div>
  );
}

function MarqueeRow({
  items,
  speedSeconds,
  direction,
  pauseOnHover,
}: {
  items: Review[];
  speedSeconds: number;
  direction: "left" | "right";
  pauseOnHover: boolean;
}) {
  const duplicated = useMemo(() => [...items, ...items], [items]);
  const duration = Math.min(120, Math.max(16, speedSeconds));
  const dragWrapRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const smoothedVelocityRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragVelocity, setDragVelocity] = useState(0);
  const loopWidthRef = useRef<number | null>(null);

  // Calculate and cache loop width (one set of items)
  const updateLoopWidth = useCallback(() => {
    if (!trackRef.current) return;
    const totalWidth = trackRef.current.scrollWidth;
    const setWidth = totalWidth / 2; // Since we have 2 sets
    loopWidthRef.current = setWidth;
  }, []);

  // Wrap offset to stay within one loop width - prevents gaps
  const wrapOffset = useCallback((offset: number): number => {
    const loopWidth = loopWidthRef.current;
    if (!loopWidth || loopWidth <= 0) return offset;
    
    // Wrap to keep offset within [-loopWidth, 0] range for seamless loop
    let wrapped = offset;
    
    // If offset goes beyond loop width, wrap it back
    while (wrapped > 0) {
      wrapped -= loopWidth;
    }
    while (wrapped <= -loopWidth) {
      wrapped += loopWidth;
    }
    
    return wrapped;
  }, []);

  const baseOffsetRef = useRef(0);
  const prevTimeRef = useRef<number | null>(null);
  const hoverRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // Update loop width when track is ready
  useEffect(() => {
    if (trackRef.current) {
      // Wait for layout
      setTimeout(() => {
        updateLoopWidth();
      }, 100);
    }
  }, [updateLoopWidth, duplicated.length]);

  const applyTransform = useCallback(() => {
    if (!dragWrapRef.current) return;
    const totalOffset = baseOffsetRef.current + dragOffset;
    const wrapped = wrapOffset(totalOffset);
    dragWrapRef.current.style.transform = `translateX(${wrapped}px)`;
  }, [dragOffset, wrapOffset]);

  useEffect(() => {
    applyTransform();
  }, [applyTransform]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    containerRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
    hoverRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = baseOffsetRef.current + dragOffset;
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = Date.now();
    smoothedVelocityRef.current = 0;
    setDragVelocity(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startXRef.current;
    const newOffset = startOffsetRef.current + dx;
    
    // Apply wrapping during drag to prevent going too far
    const wrapped = wrapOffset(newOffset);
    setDragOffset(wrapped - baseOffsetRef.current);
    
    // Calculate velocity with exponential smoothing to reduce jitter
    const now = Date.now();
    const timeDelta = now - lastMoveTimeRef.current;
    if (timeDelta > 0 && timeDelta < 100) {
      const positionDelta = e.clientX - lastMoveXRef.current;
      const instantVelocity = positionDelta * 10;
      
      // Exponential smoothing: blend new velocity with previous smoothed velocity
      const smoothingFactor = 0.25; // Lower = more smoothing (0-1)
      const previousVelocity = smoothedVelocityRef.current;
      smoothedVelocityRef.current = previousVelocity * (1 - smoothingFactor) + instantVelocity * smoothingFactor;
      
      // Dead zone: ignore very small movements to prevent jitter
      const deadZone = 4;
      if (Math.abs(smoothedVelocityRef.current) > deadZone) {
        setDragVelocity(smoothedVelocityRef.current);
      } else {
        // Gradually decay velocity when in dead zone
        smoothedVelocityRef.current *= 0.8;
        setDragVelocity(smoothedVelocityRef.current);
      }
    }
    lastMoveXRef.current = e.clientX;
    lastMoveTimeRef.current = Date.now();
  };

  const endDrag = (e?: React.PointerEvent) => {
    setIsDragging(false);
    const finalOffset = baseOffsetRef.current + dragOffset;
    baseOffsetRef.current = wrapOffset(finalOffset);
    setDragOffset(0);
    smoothedVelocityRef.current = 0;
    setDragVelocity(0);
    if (e && containerRef.current) {
      try { containerRef.current.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  useEffect(() => {
    const step = (timestamp: number) => {
      if (prevTimeRef.current == null) {
        prevTimeRef.current = timestamp;
      }
      const delta = timestamp - prevTimeRef.current;
      prevTimeRef.current = timestamp;

      if (!isDragging) {
        const loopWidth = loopWidthRef.current;
        if (loopWidth && loopWidth > 0) {
          const directionMultiplier = direction === "left" ? -1 : 1;
          const secondsPerLoop = duration;
          const pxPerMs = loopWidth / (secondsPerLoop * 1000);
          const hoverFactor = pauseOnHover && hoverRef.current ? 0.25 : 1;
          const deltaOffset = directionMultiplier * pxPerMs * delta * hoverFactor;
          
          // Update base offset and wrap immediately
          baseOffsetRef.current += deltaOffset;
          baseOffsetRef.current = wrapOffset(baseOffsetRef.current);
          applyTransform();
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      prevTimeRef.current = null;
    };
  }, [direction, duration, isDragging, wrapOffset, applyTransform, pauseOnHover]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "marquee group",
        pauseOnHover && "marquee-pause",
        isDragging && "is-dragging",
      )}
      style={{
        // @ts-expect-error CSS custom property
        "--marquee-duration": `${duration}s`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        endDrag(e);
        if (pauseOnHover) hoverRef.current = false;
      }}
      onMouseEnter={() => {
        if (pauseOnHover) hoverRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) hoverRef.current = false;
      }}
    >
      <div
        ref={dragWrapRef}
        className="marquee-drag"
      >
        <div 
          ref={trackRef}
          className={cn("marquee-track", direction === "right" && "marquee-reverse")}
        > 
          {duplicated.map((review, idx) => (
            <MarqueeItem 
              key={`${review.id ?? review.authorName}-${idx}`} 
              review={review} 
              idx={idx}
              isDragging={isDragging}
              dragVelocity={dragVelocity}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeItem({ 
  review, 
  idx, 
  isDragging = false, 
  dragVelocity = 0 
}: { 
  review: Review; 
  idx: number;
  isDragging?: boolean;
  dragVelocity?: number;
}) {
  const { authorName, authorTitle, company, avatarUrl, quote, sourceUrl } = review;
  const baseTiltDeg = (idx % 2 === 0 ? -2 : 2);
  
  // Add dynamic tilt based on drag velocity with additional smoothing
  // Velocity is negative when dragging left, positive when dragging right
  const dragTiltDeg = isDragging ? Math.max(-6, Math.min(6, dragVelocity * 0.12)) : 0;
  const tiltDeg = baseTiltDeg + dragTiltDeg;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const card = (
    <div
      className="mx-5 shrink-0 rounded-[16px] bg-[var(--color-blue)] border border-[var(--color-blue-light)] shadow-lg will-change-transform review-card flex flex-col"
      style={{ 
        width: isMobile ? 'clamp(280px, 75vw, 400px)' : 'clamp(500px, 40vw, 580px)',
        height: isMobile ? 'clamp(400px, 100vh, 500px)' : '800px',
        padding: isMobile ? 'clamp(16px, 4vw, 24px)' : 'clamp(32px, 2.5vw, 32px)',
        transform: `rotate(${tiltDeg}deg)`,
        transition: isDragging ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out',
        // @ts-expect-error CSS custom property
        '--card-tilt': `rotate(${tiltDeg}deg)`,
      }}
    >
      <div className="flex items-center gap-5 flex-shrink-0" style={{ gap: isMobile ? 'clamp(12px, 3vw, 16px)' : 'clamp(20px, 1.25vw, 20px)', marginBottom: isMobile ? 'clamp(12px, 3vw, 16px)' : 'clamp(32px, 2vw, 32px)' }}>
        <Avatar className="shadow-none ring-2 ring-white/40" style={{ width: isMobile ? 'clamp(60px, 15vw, 80px)' : '112px', height: isMobile ? 'clamp(60px, 15vw, 80px)' : '112px' }}>
          <AvatarImage src={avatarUrl} alt={authorName} className="shadow-none object-cover" />
          <AvatarFallback className="shadow-none text-[var(--color-blue)] bg-white" style={{ fontSize: isMobile ? 'clamp(18px, 4.5vw, 24px)' : 'clamp(28px, 1.75vw, 28px)' }}>{initials(authorName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-semibold text-white truncate" style={{ fontSize: isMobile ? 'clamp(16px, 4vw, 20px)' : 'clamp(24px, 1.5vw, 24px)' }}>{authorName}</div>
          {(authorTitle || company) && (
            <div className="text-white/70 truncate" style={{ fontSize: isMobile ? 'clamp(12px, 3vw, 14px)' : 'clamp(18px, 1.125vw, 18px)' }}>
              {[authorTitle, company].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </div>
      <blockquote className="text-white/90 leading-relaxed flex-1 flex items-start overflow-y-auto" style={{ fontSize: isMobile ? 'clamp(14px, 3.5vw, 18px)' : 'clamp(24px, 1.5vw, 24px)' }}>"{quote}"</blockquote>
    </div>
  );

  if (sourceUrl) {
    return (
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-blue)] rounded-2xl"
      >
        {card}
      </a>
    );
  }

  return card;
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}