import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import Footer from "@/components/Footer";
import CurvedSlider, { type CurvedItem } from "@/components/CurvedSlider";
import AmbientOrbs from "@/components/AmbientOrbs";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Moment = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export default function CandidMoments() {
  const pageRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const [cardScrollProgress, setCardScrollProgress] = useState(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const THROTTLE_MS = 8; // ~120fps for smoother animation
  const [isHoveringCards, setIsHoveringCards] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [smoothedCursorPosition, setSmoothedCursorPosition] = useState({ x: 0, y: 0 });
  const flipLabelRef = useRef<HTMLDivElement>(null);
  const smoothingRef = useRef<number | null>(null);
  const isFirstHoverRef = useRef(true);
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

  const items: CurvedItem[] = useMemo(
    () => [
      { 
        id: "01", 
        number: "01", 
        title: "BIO International", 
        imageUrl: "/optimised/IMG_7218.jpg",
        backImageUrl: "/optimised/Adam and Harriet 3.jpg",
        description: "Connecting with partners at BIO International — sharing ideas, making next-level introductions, and keeping the energy high all day."
      },
      { 
        id: "02", 
        number: "02", 
        title: "Taj Mahal Sunrise", 
        imageUrl: "/optimised/IMG_6722.jpg",
        backImageUrl: "/optimised/Adam and Harriet 6.jpg",
        description: "Global reach in action: sunrise calls from Agra before a full day of meetings across India's thriving CDMO landscape."
      },
      { 
        id: "03", 
        number: "03", 
        title: "Physics of Life", 
        imageUrl: "/optimised/IMG_4193.jpg",
        backImageUrl: "/optimised/Adam and Harriet 7.jpg",
        description: "Diving deep into frontier science at Physics of Life — learning where discovery meets commercialisation."
      },
      { 
        id: "04", 
        number: "04", 
        title: "Harrogate HQ", 
        imageUrl: "/optimised/IMG_4722.jpg",
        backImageUrl: "/optimised/Harriet Headshot 2.jpg",
        description: "A caffeine-fuelled strategy sprint back home in Harrogate — planning the next slate of senior hires in the sun."
      },
      { 
        id: "05", 
        number: "05", 
        title: "Curia Catch-ups", 
        imageUrl: "/optimised/IMG_4855.jpg",
        backImageUrl: "/optimised/Harriet Headshot 3.jpg",
        description: "On the floor at CPHI with Curia's leadership team — translating market intel into real hiring momentum."
      },
      { 
        id: "06", 
        number: "06", 
        title: "CPHI Barcelona", 
        imageUrl: "/optimised/IMG_1198.jpg",
        backImageUrl: "/optimised/Harriet Headshot 8.jpg",
        description: "Barcelona sunshine, back-to-back meetings, and a diary filled with new collaborations."
      },
      { 
        id: "07", 
        number: "07", 
        title: "Night Sessions", 
        imageUrl: "/optimised/IMG_0191.jpg",
        backImageUrl: "/optimised/Adam Headshot 3.jpg",
        description: "Late-night debriefs with friends and partners — because the best ideas often arrive after hours."
      },
      { 
        id: "08", 
        number: "08", 
        title: "Conference Crew", 
        imageUrl: "/optimised/IMG_7191.jpg",
        backImageUrl: "/optimised/Adam Headshot 4.jpg",
        description: "Rounding off a packed conference day — celebrating the wins and plotting the next wave of moves."
      },
    ],
    [],
  );

  // Optimized progress update handler
  const updateProgress = useCallback((progress: number) => {
    const now = performance.now();
    
    // Throttle updates for smooth performance
    if (now - lastUpdateTimeRef.current < THROTTLE_MS) {
      return;
    }
    
    // Only update if progress changed significantly
    if (Math.abs(progress - progressRef.current) > 0.001) {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          setCardScrollProgress(progress);
          progressRef.current = progress;
          lastUpdateTimeRef.current = performance.now();
          rafRef.current = null;
        });
      }
    }
  }, []);

  // Header section animations
  useGSAP(() => {
    if (sliderRef.current) {
      gsap.from(sliderRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: sliderRef.current,
          start: 'top 80%',
          once: true
        }
      });
    }
  }, []);

  // Pin the cards section when it reaches the viewport and track scroll progress for card animations
  useGSAP(() => {
    if (cardsSectionRef.current && pinWrapperRef.current) {
      const viewportHeight = window.innerHeight;
      const pinDuration = viewportHeight * 4.5; // Increased duration for smoother, more gradual animation

      const pinTrigger = ScrollTrigger.create({
        trigger: pinWrapperRef.current,
        start: 'top top',
        end: `+=${pinDuration}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        markers: false,
        refreshPriority: -1, // Lower priority for better performance
        onUpdate: (self) => {
          // Update progress - smooth interpolation handled by lerp in useEffect
          updateProgress(self.progress);
        },
      });

      return () => {
        if (pinTrigger) {
          pinTrigger.kill();
        }
      };
    }
  }, [updateProgress]);


  // Smooth cursor position with damping - disabled on mobile
  useEffect(() => {
    if (isMobile || !isHoveringCards) {
      isFirstHoverRef.current = true;
      return;
    }

    // Initialize position immediately on first hover
    if (isFirstHoverRef.current && cursorPosition.x !== 0 && cursorPosition.y !== 0) {
      setSmoothedCursorPosition({ x: cursorPosition.x, y: cursorPosition.y });
      isFirstHoverRef.current = false;
    }

    const updateSmoothPosition = () => {
      setSmoothedCursorPosition(prev => {
        const damping = 0.15;
        const newX = prev.x + (cursorPosition.x - prev.x) * damping;
        const newY = prev.y + (cursorPosition.y - prev.y) * damping;
        return { x: newX, y: newY };
      });
      smoothingRef.current = requestAnimationFrame(updateSmoothPosition);
    };

    smoothingRef.current = requestAnimationFrame(updateSmoothPosition);

    return () => {
      if (smoothingRef.current) {
        cancelAnimationFrame(smoothingRef.current);
      }
    };
  }, [isHoveringCards, cursorPosition, isMobile]);

  // Fade in/out flip label - disabled on mobile
  useEffect(() => {
    if (!flipLabelRef.current || isMobile) {
      if (flipLabelRef.current) {
        flipLabelRef.current.style.display = 'none';
      }
      return;
    }

    if (isHoveringCards) {
      gsap.to(flipLabelRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
          if (flipLabelRef.current) {
            flipLabelRef.current.style.display = 'block';
          }
        }
      });
    } else {
      gsap.to(flipLabelRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          if (flipLabelRef.current) {
            flipLabelRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isHoveringCards, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (smoothingRef.current) {
        cancelAnimationFrame(smoothingRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={pageRef}
        className="relative px-6 overflow-hidden" 
        style={{ backgroundColor: 'var(--color-peach)' }}
      >
        <AmbientOrbs tone="peach" />
      </div>

      {/* Pinned Cards Section */}
      <div 
        ref={pinWrapperRef}
        className="relative w-full overflow-visible"
        style={{ backgroundColor: 'var(--color-peach)' }}
      >
        <div 
          ref={cardsSectionRef} 
          className="relative min-h-screen flex items-center justify-center px-6 pt-24 overflow-visible"
        >
          <div ref={sliderRef} className="max-w-7xl mx-auto w-full overflow-visible">
            <CurvedSlider 
              items={items} 
              accentFrom="var(--color-blue)" 
              accentTo="var(--color-blue-light)" 
              scrollProgress={cardScrollProgress}
              onCardHover={setIsHoveringCards}
              onCardMouseMove={!isMobile ? ((x, y) => setCursorPosition({ x, y })) : undefined}
            />
          </div>
        </div>

        {/* Flip label that follows cursor - hidden on mobile */}
        {!isMobile && (
          <div
            ref={flipLabelRef}
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
            Flip
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
