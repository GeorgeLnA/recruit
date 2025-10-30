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
  scrollProgress = 0,
}: CurvedSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);

  // Easing function for smooth animations
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  // Update card positions based on scroll progress
  useEffect(() => {
    if (!containerRef.current || items.length === 0) return;

    const updateCards = () => {
      const totalItems = items.length;
      const centerIndex = (totalItems - 1) / 2;
      const cardSpacing = 26; // Increased distance between cards
      const maxTravel = 200; // Maximum horizontal movement in vw
      const maxTilt = 20; // Maximum rotation angle in degrees
      const baseY = -350; // Vertical position (negative = higher up)

      // Apply easing to progress for smoother animation
      const easedProgress = easeOutCubic(scrollProgress);

      items.forEach((_, index) => {
        const cardEl = cardRefs.current[index];
        if (!cardEl) return;

        // Calculate card position relative to center
        const distanceFromCenter = (index - centerIndex) * cardSpacing;
        
        // Shift all cards so that card 01 (index 0) starts centered
        // Card 01 is at index 0, centerIndex=3, so we shift by centerIndex * cardSpacing
        const centerOffset = centerIndex * cardSpacing;
        const baseX = distanceFromCenter + centerOffset;
        
        // Calculate final position with scroll-based movement
        const targetX = baseX - (easedProgress * maxTravel);
        
        // Calculate tilt based on distance from center and progress
        const tiltOffset = index * 0.1;
        const tiltProgress = Math.max(0, Math.min(1, (easedProgress - tiltOffset) / (1 - tiltOffset)));
        const tilt = -maxTilt * easeOutCubic(tiltProgress);

        // Apply transform using transform3d for hardware acceleration
        cardEl.style.transform = `translate3d(${targetX}vw, ${baseY}px, 0) rotate(${tilt}deg)`;
        cardEl.style.opacity = '1'; // Full opacity for all cards, no fade effect
      });

      lastProgressRef.current = scrollProgress;
    };

    // Use requestAnimationFrame for smooth updates
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        updateCards();
        rafRef.current = null;
      });
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [items, scrollProgress]);

  const handleToggle = useCallback((id: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-screen flex items-center justify-center overflow-visible",
        className,
      )}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {items.map((item, index) => {
          const isFlipped = flipped.has(item.id);
          return (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="absolute w-[22vw] min-w-[220px] max-w-[420px] aspect-[400/472]"
                style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                willChange: 'transform',
                transformOrigin: 'center center',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                onClick={() => handleToggle(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(item.id);
                  }
                }}
                className="flip-card h-full w-full cursor-pointer"
              >
                <div className={cn("flip-inner h-full w-full", isFlipped && "flipped")}>
                  {/* Front */}
                  <div className="flip-front h-full w-full relative rounded-[16px] overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      className="object-cover-absolute"
                      loading="lazy"
                      decoding="async"
                    />
                    {item.number && (
                      <p className="absolute top-8 left-8 text-white text-xl font-bold z-10" style={{ fontFamily: 'Milker' }}>
                        {item.number}
                      </p>
                    )}
                    <figcaption className="absolute bottom-6 md:bottom-10 xl:bottom-12 left-6 md:left-10 xl:left-12 text-white text-xl md:text-2xl font-bold z-10" style={{ fontFamily: 'Milker' }}>
                      {item.title}
                    </figcaption>
                  </div>

                  {/* Back */}
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
                          <p className="absolute top-8 left-8 text-white text-xl font-bold z-10" style={{ fontFamily: 'Milker' }}>
                            {item.number}
                          </p>
                        )}
                        <figcaption className="absolute bottom-6 md:bottom-10 xl:bottom-12 left-6 md:left-10 xl:left-12 text-white text-xl md:text-2xl font-bold z-10" style={{ fontFamily: 'Milker' }}>
                          {item.title}
                        </figcaption>
                      </>
                    ) : (
                      <div className="h-full w-full bg-white p-6 flex items-center justify-center rounded-[16px]">
                        <p className="text-gray-800 text-base md:text-lg leading-relaxed text-center">
                          {item.description || "More details coming soon."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
