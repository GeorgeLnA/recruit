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
        imageUrl: "/candid/Photo 1.webp",
        backImageUrl: "/candid/Photo 1 flip.webp",
        description: "Connecting with partners at BIO International — sharing ideas, making next-level introductions, and keeping the energy high all day."
      },
      { 
        id: "02", 
        number: "02", 
        title: "Taj Mahal Sunrise", 
        imageUrl: "/candid/Photo 2.webp",
        backImageUrl: "/candid/Photo 2 flip.webp",
        description: "Global reach in action: sunrise calls from Agra before a full day of meetings across India's thriving CDMO landscape."
      },
      { 
        id: "03", 
        number: "03", 
        title: "Physics of Life", 
        imageUrl: "/candid/Photo 3.webp",
        backImageUrl: "/candid/Photo 3 flip.webp",
        description: "Diving deep into frontier science at Physics of Life — learning where discovery meets commercialisation."
      },
      { 
        id: "04", 
        number: "04", 
        title: "Harrogate HQ", 
        imageUrl: "/candid/Photo 4.webp",
        backImageUrl: "/candid/Photo 4 flip.webp",
        description: "A caffeine-fuelled strategy sprint back home in Harrogate — planning the next slate of senior hires in the sun."
      },
      { 
        id: "05", 
        number: "05", 
        title: "Curia Catch-ups", 
        imageUrl: "/candid/Photo 5.webp",
        backImageUrl: "/candid/Photo 5 flip.webp",
        description: "On the floor at CPHI with Curia's leadership team — translating market intel into real hiring momentum."
      },
      { 
        id: "06", 
        number: "06", 
        title: "CPHI Barcelona", 
        imageUrl: "/candid/Photo 6.webp",
        backImageUrl: "/candid/Photo 6 flip.webp",
        description: "Barcelona sunshine, back-to-back meetings, and a diary filled with new collaborations."
      },
      { 
        id: "07", 
        number: "07", 
        title: "Night Sessions", 
        imageUrl: "/candid/Photo 7.webp",
        backImageUrl: "/candid/Photo 7 flip.webp",
        description: "Late-night debriefs with friends and partners — because the best ideas often arrive after hours."
      },
      { 
        id: "08", 
        number: "08", 
        title: "Conference Crew", 
        imageUrl: "/candid/Photo 8.webp",
        backImageUrl: "/candid/Photo 8 flip.webp",
        description: "Rounding off a packed conference day — celebrating the wins and plotting the next wave of moves."
      },
      { 
        id: "09", 
        number: "09", 
        title: "Industry Connections", 
        imageUrl: "/candid/Photo 9.webp",
        backImageUrl: "/candid/Photo 9 flip.webp",
        description: "Building lasting relationships with industry leaders — where every conversation opens new doors."
      },
      { 
        id: "10", 
        number: "10", 
        title: "Global Networking", 
        imageUrl: "/candid/Photo 10.webp",
        backImageUrl: "/candid/Photo 10 flip.webp",
        description: "Expanding our network across continents — connecting talent with opportunities worldwide."
      },
      { 
        id: "11", 
        number: "11", 
        title: "Strategic Partnerships", 
        imageUrl: "/candid/Photo 11.webp",
        backImageUrl: "/candid/Photo 11 flip.webp",
        description: "Forging strategic partnerships that drive innovation and growth in the life sciences sector."
      },
      { 
        id: "12", 
        number: "12", 
        title: "Innovation Hub", 
        imageUrl: "/candid/Photo 12.webp",
        backImageUrl: "/candid/Photo 12 flip.webp",
        description: "At the heart of innovation — exploring cutting-edge technologies and breakthrough discoveries."
      },
      { 
        id: "13", 
        number: "13", 
        title: "Collaborative Spirit", 
        imageUrl: "/candid/Photo 13.webp",
        backImageUrl: "/candid/Photo 13 flip.webp",
        description: "Working together to solve complex challenges — collaboration is key to success."
      },
      { 
        id: "14", 
        number: "14", 
        title: "Future Forward", 
        imageUrl: "/candid/Photo 14.webp",
        backImageUrl: "/candid/Photo 14 flip.webp",
        description: "Looking ahead to the future of life sciences — shaping tomorrow's breakthroughs today."
      },
      { 
        id: "15", 
        number: "15", 
        title: "Making Impact", 
        imageUrl: "/candid/Photo 15.webp",
        backImageUrl: "/candid/Photo 15 flip.webp",
        description: "Creating meaningful impact in the industry — one connection, one placement, one success at a time."
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
              backgroundColor: 'var(--color-peach)',
              color: 'var(--color-blue)',
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
