import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";

interface ClientLogo {
  id: string;
  name: string;
  imageUrl: string;
  alt?: string;
}

interface ClientLogoMarqueeProps {
  logos: ClientLogo[];
  speedSeconds?: number;
  pauseOnHover?: boolean;
  className?: string;
  rows?: 1 | 2;
}

const defaultLogos: ClientLogo[] = [
  {
    id: "lifecore",
    name: "Lifecore",
    imageUrl: "/logos/Lifecore-Inj-CDMO_Logo_2C-e1761664162878.png",
  },
  {
    id: "solvias",
    name: "Solvias",
    imageUrl: "/logos/solvias-logo-1.jpg",
  },
  {
    id: "smartcatch",
    name: "Smartcatch",
    imageUrl: "/logos/smartcatch_logo.jpeg",
  },
  {
    id: "bora",
    name: "Bora",
    imageUrl: "/logos/bora840x454.jpg",
  },
  {
    id: "enso",
    name: "Enso",
    imageUrl: "/logos/104_main-8.jpg",
  },
  {
    id: "pharmacircle",
    name: "PharmaCircle",
    imageUrl: "/logos/_get_company_logo.png",
  },
  {
    id: "ensera",
    name: "Ensera Healthcare",
    imageUrl: "/logos/SteriPack-rebrands-to-Ensera-Healthcare-CDMO.jpg",
  },
  {
    id: "enzo",
    name: "Enzo",
    imageUrl: "/logos/logo.png",
  },
  {
    id: "pace",
    name: "Pace",
    imageUrl: "/logos/Pace-840-x-454.png",
  },
  {
    id: "fuji",
    name: "Fuji",
    imageUrl: "/logos/FujiStacked.jpg",
  },
  {
    id: "vector-labs",
    name: "Vector Laboratories",
    imageUrl: "/logos/vector_laboratories_logo.jpeg",
  },
  {
    id: "contract-pharma-1",
    name: "Contract Pharma",
    imageUrl: "/logos/345_main.png",
  },
  {
    id: "contract-pharma-2",
    name: "Contract Pharma",
    imageUrl: "/logos/452_main-8.jpg",
  },
  {
    id: "saphetor",
    name: "Saphetor",
    imageUrl: "/logos/Saphetor_Logo.jpg",
  },
  {
    id: "ascend",
    name: "Ascend Advanced Therapies",
    imageUrl: "/logos/Ascend_Advanced_Therapies_Logo.jpg",
  },
  {
    id: "novigenix",
    name: "Novigenix",
    imageUrl: "/logos/Novigenix_logo_210x180.png",
  },
  {
    id: "agc",
    name: "AGC Pharma Chemicals",
    imageUrl: "/logos/agc_ld-jpg.webp",
  },
  {
    id: "thermo-fisher",
    name: "Thermo Fisher Scientific",
    imageUrl: "/logos/2560px-Thermo_Fisher_Scientific_logo.svg.png",
  },
  {
    id: "predicine",
    name: "Predicine",
    imageUrl: "/logos/Predicine-Logo-Blue-300x129.jpg",
  },
];

export default function ClientLogoMarquee({
  logos = defaultLogos,
  speedSeconds = 40,
  pauseOnHover = true,
  className = "",
  rows = 1,
}: ClientLogoMarqueeProps) {
  const safeLogos = Array.isArray(logos) ? logos.filter(Boolean) : defaultLogos;
  if (safeLogos.length === 0) return null;

  const firstRow = safeLogos;
  const secondRow = useMemo(() => [...safeLogos].reverse(), [safeLogos]);

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
  items: ClientLogo[];
  speedSeconds: number;
  direction: "left" | "right";
  pauseOnHover: boolean;
}) {
  // Duplicate items twice for seamless infinite loop
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
  const [isHoveringMarquee, setIsHoveringMarquee] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [smoothedCursorPosition, setSmoothedCursorPosition] = useState({ x: 0, y: 0 });
  const dragLabelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate and cache loop width (one set of items)
  const updateLoopWidth = useCallback(() => {
    if (!trackRef.current) return;
    const firstItem = trackRef.current.firstElementChild as HTMLElement;
    if (!firstItem) return;
    
    // Calculate width of one set by finding where first item repeats
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
    
    // Calculate velocity
    const now = Date.now();
    const timeDelta = now - lastMoveTimeRef.current;
    if (timeDelta > 0 && timeDelta < 100) {
      const positionDelta = e.clientX - lastMoveXRef.current;
      const instantVelocity = positionDelta * 10;
      const smoothingFactor = 0.25;
      smoothedVelocityRef.current = smoothedVelocityRef.current * (1 - smoothingFactor) + instantVelocity * smoothingFactor;
      
      const deadZone = 4;
      if (Math.abs(smoothedVelocityRef.current) > deadZone) {
        setDragVelocity(smoothedVelocityRef.current);
      } else {
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

  // Smooth cursor position with damping - disabled on mobile
  useEffect(() => {
    if (isMobile || !isHoveringMarquee || isDragging) {
      setSmoothedCursorPosition(cursorPosition);
      return;
    }
    
    const damping = 0.2;
    let rafId: number | null = null;
    
    const animate = () => {
      setSmoothedCursorPosition(prev => ({
        x: prev.x + (cursorPosition.x - prev.x) * damping,
        y: prev.y + (cursorPosition.y - prev.y) * damping
      }));
      
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [cursorPosition, isHoveringMarquee, isDragging, isMobile]);

  // Fade in/out animation for drag label
  useEffect(() => {
    const label = dragLabelRef.current;
    if (!label) return;

    const shouldShow = isHoveringMarquee && !isDragging;

    if (shouldShow) {
      // Fade in when hovering
      label.style.display = 'block';
      gsap.killTweensOf(label);
      gsap.to(label, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      // Fade out when not hovering or when dragging
      gsap.killTweensOf(label);
      gsap.to(label, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          if (label && !shouldShow) {
            label.style.display = 'none';
          }
        }
      });
    }
  }, [isHoveringMarquee, isDragging]);

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
      onPointerMove={(e) => {
        onPointerMove(e);
        if (!isMobile) {
          setCursorPosition({
            x: e.clientX,
            y: e.clientY
          });
        }
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={(e) => {
        endDrag(e);
        setIsHoveringMarquee(false);
        if (pauseOnHover) hoverRef.current = false;
      }}
      onMouseEnter={() => {
        if (!isMobile) {
          setIsHoveringMarquee(true);
          if (pauseOnHover) hoverRef.current = true;
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsHoveringMarquee(false);
          if (pauseOnHover) hoverRef.current = false;
        }
      }}
    >
      {/* Drag label that follows cursor - hidden on mobile */}
      {!isMobile && (
        <div
          ref={dragLabelRef}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${smoothedCursorPosition.x + 10}px`,
            top: `${smoothedCursorPosition.y + 10}px`,
          transform: 'translate(0, 0)',
          backgroundColor: '#464C53',
          color: '#FF9752',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'TexGyreAdventor',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          opacity: 0,
          display: 'none'
        }}
      >
        Drag
      </div>
      )}
      <div
        ref={dragWrapRef}
        className="marquee-drag"
      >
        <div 
          ref={trackRef}
          className={cn("marquee-track", direction === "right" && "marquee-reverse")}
          style={{ minHeight: '250px', alignItems: 'center', paddingTop: '20px', paddingBottom: '20px' }}
        > 
          {duplicated.map((logo, idx) => (
            <MarqueeItem 
              key={`${logo.id}-${idx}`} 
              logo={logo} 
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
  logo, 
  idx, 
  isDragging = false, 
  dragVelocity = 0 
}: { 
  logo: ClientLogo; 
  idx: number;
  isDragging?: boolean;
  dragVelocity?: number;
}) {
  const baseTiltDeg = 0;
  const dragTiltDeg = isDragging ? Math.max(-3, Math.min(3, dragVelocity * 0.08)) : 0;
  const tiltDeg = baseTiltDeg + dragTiltDeg;

  return (
    <div
      className="mx-3 shrink-0 flex items-center justify-center"
      style={{ 
        transform: `rotate(${tiltDeg}deg)`,
        transition: isDragging ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out',
      }}
    >
      <div className="client-card logo-card-group rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ width: '250px', height: '250px', backgroundColor: '#FFF5E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={logo.imageUrl} 
          alt={logo.alt || logo.name} 
          className="logo-image max-w-full max-h-full object-contain filter grayscale transition-all duration-300"
          style={{ 
            mixBlendMode: 'multiply',
            backgroundColor: 'transparent'
          }}
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}

