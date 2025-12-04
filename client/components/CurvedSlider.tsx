import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type CurvedItem = {
  id: string;
  title: string;
  number?: string;
  imageUrl: string;
  backImageUrl?: string;
  description?: string;
};

interface CurvedSliderProps {
  items: CurvedItem[];
  className?: string;
  accentFrom?: string;
  accentTo?: string;
  scrollProgress?: number;
  onCardHover?: (isHovering: boolean) => void;
  onCardMouseMove?: (x: number, y: number) => void;
}

export default function CurvedSlider({
  items,
  className = "",
  accentFrom = "var(--color-blue)",
  accentTo = "var(--color-peach)",
  scrollProgress: externalProgress,
  onCardHover,
  onCardMouseMove,
}: CurvedSliderProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const lastTransformRef = useRef<string[]>([]);
  const [cardWidthVw, setCardWidthVw] = useState(28);
  const [spacingVw, setSpacingVw] = useState(10);
  const [maxCardWidth, setMaxCardWidth] = useState(480);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (externalProgress !== undefined) {
      // Always update external progress to trigger transform updates
      if (Math.abs(externalProgress - lastProgressRef.current) > 0.0001) {
        setProgress(externalProgress);
        lastProgressRef.current = externalProgress;
      }
      return;
    }

    let rafId: number | null = null;

    const onScroll = () => {
      if (!sectionRef.current) return;
      
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const rect = sectionRef.current?.getBoundingClientRect();
          if (!rect) return;
          const h = Math.max(rect.height, 1);
          const p = 1 - Math.min(1, Math.max(0, (rect.bottom - 120) / (h + 1)));
          
          // Only update if progress changed significantly
          if (Math.abs(p - lastProgressRef.current) > 0.001) {
            setProgress(p);
            lastProgressRef.current = p;
          }
          
          rafId = null;
        });
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [externalProgress]);

  // Initialize transform ref array
  useEffect(() => {
    if (lastTransformRef.current.length !== items.length) {
      lastTransformRef.current = new Array(items.length).fill('');
    }
  }, [items.length]);

  // Calculate card width dynamically based on viewport with max-width constraint
  useEffect(() => {
    const calculateCardSize = () => {
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      const maxCardWidth = isMobile ? 600 : 480; // Much larger max width on mobile
      const baseCardWidthVw = isMobile ? 70 : 28; // Much larger base width on mobile (70vw vs 28vw)
      
      // Calculate what baseCardWidthVw equals in pixels
      const baseCardWidthPx = (viewportWidth * baseCardWidthVw) / 100;
      
      // Use the smaller of base width or max width, then convert back to vw
      const actualCardWidthPx = Math.min(baseCardWidthPx, maxCardWidth);
      const actualCardWidthVw = (actualCardWidthPx / viewportWidth) * 100;
      
      // Calculate spacing as percentage of card width for consistent overlap
      const overlapPercentage = 0.54; // 54% overlap means spacing is 46% of card width
      const calculatedSpacingVw = actualCardWidthVw * (1 - overlapPercentage);
      
      setCardWidthVw(actualCardWidthVw);
      setSpacingVw(calculatedSpacingVw);
      setMaxCardWidth(maxCardWidth);
      setIsMobile(isMobile);
    };

    calculateCardSize();
    window.addEventListener('resize', calculateCardSize);
    return () => window.removeEventListener('resize', calculateCardSize);
  }, []);

  // Update transforms directly via DOM (no React re-renders)
  useEffect(() => {
    const currentProgress = externalProgress !== undefined ? externalProgress : progress;
    const totalItems = items.length;
    const centerIndex = (totalItems - 1) / 2;
    const baseTilt = 65; // Increased for more significant tilt
    const staggerDelay = 0.12;

    const updateTransforms = () => {
      // Calculate last card's start position to determine travel distances
      const lastCardIndex = totalItems - 1;
      const firstCardIndex = 0;
      const baseVerticalOffset = -30; // Move starting position higher
      // Last card starts at its spread position from center (where first card starts)
      const lastCardHorizontalSpread = (lastCardIndex - firstCardIndex) * spacingVw;
      const lastCardVerticalSpread = (lastCardIndex - firstCardIndex) * 35;
      const lastCardStartX = lastCardHorizontalSpread;
      const lastCardStartY = baseVerticalOffset + lastCardVerticalSpread;
      
      // Calculate travel distances so last card reaches center (0, 0) when progress = 1
      // Note: diagonalDistanceY is calculated independently - globalUpwardOffset is additional
      // When progress = 1: x = 0, y = 0
      // 0 = lastCardStartX - 1 * diagonalDistanceX  =>  diagonalDistanceX = lastCardStartX
      // 0 = lastCardStartY - 1 * diagonalDistanceY  =>  diagonalDistanceY = lastCardStartY
      const diagonalDistanceX = lastCardStartX;
      const diagonalDistanceY = lastCardStartY;
      
      items.forEach((_, i) => {
        const cardEl = cardRefs.current[i];
        if (!cardEl) return;

        // Position cards so first card (index 0) starts at center of screen (slightly higher)
        // Calculate base positions to center the first card
        const firstCardIndex = 0;
        const baseVerticalOffset = -30; // Move starting position higher
        const horizontalSpread = (i - firstCardIndex) * spacingVw;
        const verticalSpread = (i - firstCardIndex) * 35; // Stagger vertically for diagonal row
        
        // First card starts at center (0, 0) but higher, other cards spread from there
        const startX = horizontalSpread;
        const startY = baseVerticalOffset + verticalSpread;
        
        // Each card travels independently on diagonal path: bottom-right to top-left
        // All cards use the same progress - they all travel at the same time
        const cardProgress = currentProgress;
        
        // Global vertical offset - moves entire row up with scroll so last card isn't too low
        const globalUpwardOffset = currentProgress * 35; // Additional upward movement for whole row
        
        // Calculate current position based on card progress (all cards use same progress)
        const x = startX - cardProgress * diagonalDistanceX;
        const y = startY - cardProgress * diagonalDistanceY - globalUpwardOffset;
        
        // Individual rotation based on position: cards on right tilt right, at center upright, on left tilt left
        // Rotation is proportional to distance from center (x = 0)
        // Use last card's start position as max distance reference for consistent rotation
        const maxDistanceFromCenter = Math.abs(lastCardStartX) || 1; // Avoid division by zero
        const rotationFactor = x / maxDistanceFromCenter; // -1 to 1, 0 at center
        const deg = baseTilt * rotationFactor; // Positive (right) on right side, 0 at center, negative (left) on left side

        const transformStr = `translate3d(-50%, -50%, 0) translateX(${x}vw) translateY(${y}px) rotate(${deg}deg)`;
        
        // Calculate z-index: cards further along their journey (higher progress) appear on top
        // Also account for position - cards more to top-left have higher z-index
        const zIndex = Math.round(1000 + i * 10 + cardProgress * 100);
        
        // Only update if transform changed
        if (lastTransformRef.current[i] !== transformStr) {
          cardEl.style.left = `calc(50% + ${x}vw)`;
          cardEl.style.top = `calc(50% + ${y}px)`;
          cardEl.style.transform = transformStr;
          cardEl.style.zIndex = `${zIndex}`;
          lastTransformRef.current[i] = transformStr;
        }
      });
    };

    // Always schedule an update when progress changes
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      updateTransforms();
      rafRef.current = null;
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [items, progress, externalProgress, spacingVw]);

  const handleToggle = useCallback((id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative h-screen w-full mx-auto text-white overflow-visible",
        className,
      )}
    >
      <div className="h-full flex items-center justify-center w-full relative z-10 overflow-visible">
         {items.map((item, index) => {
           const isFlipped = flipped.has(item.id);
           return (
            <figure
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={cn("absolute overflow-visible")}
              style={{ 
                width: `${cardWidthVw}vw`,
                maxWidth: `${maxCardWidth}px`,
                aspectRatio: isMobile ? '400/700' : '400/472', // Much taller on mobile
                left: '50%',
                top: '50%',
                transform: 'translate3d(-50%, -50%, 0)',
                willChange: 'transform',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                onClick={() => handleToggle(item.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleToggle(item.id)}
                className="flip-card h-full w-full"
                onMouseEnter={() => onCardHover?.(true)}
                onMouseLeave={() => onCardHover?.(false)}
                onMouseMove={(e) => {
                  // Disable cursor tracking on mobile/touch devices
                  if (onCardMouseMove && !('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
                    onCardMouseMove(e.clientX, e.clientY);
                  }
                }}
              >
                <div className={cn("flip-inner h-full w-full", isFlipped && "flipped")}> 
                  <div className="flip-front h-full w-full relative rounded-[16px] overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      className="object-cover-absolute"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="flip-back absolute inset-0 rounded-[16px] overflow-hidden">
                    {item.backImageUrl ? (
                      <img 
                        src={item.backImageUrl} 
                        alt="" 
                        className="object-cover-absolute"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="object-cover-absolute"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                </div>
              </div>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

