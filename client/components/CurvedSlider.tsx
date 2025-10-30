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
}

export default function CurvedSlider({
  items,
  className = "",
  accentFrom = "#01FFA4",
  accentTo = "#0028F8",
  scrollProgress: externalProgress,
}: CurvedSliderProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);
  const lastTransformRef = useRef<string[]>([]);

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

  // Update transforms directly via DOM (no React re-renders)
  useEffect(() => {
    const currentProgress = externalProgress !== undefined ? externalProgress : progress;
    const totalItems = items.length;
    const centerIndex = (totalItems - 1) / 2;
    const spacingVw = 32;
    const baseTilt = 25;
    const staggerDelay = 0.12;

    const updateTransforms = () => {
      items.forEach((_, i) => {
        const cardEl = cardRefs.current[i];
        if (!cardEl) return;

        const distanceFromCenter = (i - centerIndex) * spacingVw;
        const startX = distanceFromCenter + 105;
        const startY = -80;
        const x = startX - currentProgress * 250;
        const y = startY;
        const tiltProgressOffset = i * staggerDelay;
        const tiltProgress = Math.max(0, Math.min(1, (currentProgress - tiltProgressOffset) / (1 - tiltProgressOffset)));
        const deg = -baseTilt * tiltProgress;

        const transformStr = `translate3d(-50%, -50%, 0) translateX(${x}vw) translateY(${y}px) rotate(${deg}deg)`;
        
        // Only update if transform changed
        if (lastTransformRef.current[i] !== transformStr) {
          cardEl.style.left = `calc(50% + ${x}vw)`;
          cardEl.style.top = `calc(50% + ${y}px)`;
          cardEl.style.transform = transformStr;
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
  }, [items, progress, externalProgress]);

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
              className={cn("w-[25vw] min-w-[240px] max-w-[500px] aspect-[400/472] absolute overflow-visible")}
              style={{ 
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
                    {item.number && (
                      <p className="absolute top-8 left-8 text-white text-xl font-bold" style={{ fontFamily: 'Milker' }}>{item.number}</p>
                    )}
                    <figcaption className="absolute bottom-6 md:bottom-10 xl:bottom-12 left-6 md:left-10 xl:left-12 text-white text-xl md:text-2xl font-bold" style={{ fontFamily: 'Milker' }}>
                      {item.title}
                    </figcaption>
                  </div>

                  <div className="flip-back absolute inset-0 rounded-[16px] overflow-hidden">
                    {item.backImageUrl ? (
                      <>
                        <img 
                          src={item.backImageUrl} 
                          alt="" 
                          className="object-cover-absolute"
                          loading="lazy"
                          decoding="async"
                        />
                        {item.number && (
                          <p className="absolute top-8 left-8 text-white text-xl font-bold" style={{ fontFamily: 'Milker' }}>{item.number}</p>
                        )}
                        <figcaption className="absolute bottom-6 md:bottom-10 xl:bottom-12 left-6 md:left-10 xl:left-12 text-white text-xl md:text-2xl font-bold" style={{ fontFamily: 'Milker' }}>
                          {item.title}
                        </figcaption>
                      </>
                    ) : (
                      <div className="h-full w-full bg-white p-6 flex items-center justify-center rounded-[16px]">
                        <p className="text-white text-base md:text-lg leading-relaxed text-center">
                          {item.description || "More details coming soon."}
                        </p>
                      </div>
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

