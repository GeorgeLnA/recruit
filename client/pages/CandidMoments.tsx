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

  const items: CurvedItem[] = useMemo(
    () => [
      { 
        id: "01", 
        number: "01", 
        title: "BIO International", 
        imageUrl: "/optimised/IMG_7218.jpg",
        description: "Connecting with partners at BIO International — sharing ideas, making next-level introductions, and keeping the energy high all day."
      },
      { 
        id: "02", 
        number: "02", 
        title: "Taj Mahal Sunrise", 
        imageUrl: "/optimised/IMG_6722.jpg",
        description: "Global reach in action: sunrise calls from Agra before a full day of meetings across India’s thriving CDMO landscape."
      },
      { 
        id: "03", 
        number: "03", 
        title: "Physics of Life", 
        imageUrl: "/optimised/IMG_4193.jpg",
        description: "Diving deep into frontier science at Physics of Life — learning where discovery meets commercialisation."
      },
      { 
        id: "04", 
        number: "04", 
        title: "Harrogate HQ", 
        imageUrl: "/optimised/IMG_4722.jpg",
        description: "A caffeine-fuelled strategy sprint back home in Harrogate — planning the next slate of senior hires in the sun."
      },
      { 
        id: "05", 
        number: "05", 
        title: "Curia Catch-ups", 
        imageUrl: "/optimised/IMG_4855.jpg",
        description: "On the floor at CPHI with Curia’s leadership team — translating market intel into real hiring momentum."
      },
      { 
        id: "06", 
        number: "06", 
        title: "CPHI Barcelona", 
        imageUrl: "/optimised/IMG_1198.jpg",
        description: "Barcelona sunshine, back-to-back meetings, and a diary filled with new collaborations."
      },
      { 
        id: "07", 
        number: "07", 
        title: "Night Sessions", 
        imageUrl: "/optimised/IMG_0191.jpg",
        description: "Late-night debriefs with friends and partners — because the best ideas often arrive after hours."
      },
      { 
        id: "08", 
        number: "08", 
        title: "Conference Crew", 
        imageUrl: "/optimised/IMG_7191.jpg",
        description: "Rounding off a packed conference day — celebrating the wins and plotting the next wave of moves."
      },
    ],
    [],
  );

  // Optimized progress update handler with time-based throttling
  const updateProgress = useCallback((progress: number) => {
    const now = performance.now();
    
    // Throttle updates to ~60fps
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
      const pinDuration = viewportHeight * 3;

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        ref={pageRef}
        className="relative px-6 overflow-hidden" 
        style={{ backgroundColor: '#FF914D' }}
      >
        <AmbientOrbs tone="peach" />
      </div>

      {/* Pinned Cards Section */}
      <div 
        ref={pinWrapperRef}
        className="relative w-full overflow-visible"
        style={{ backgroundColor: '#FF914D' }}
      >
        <div ref={cardsSectionRef} className="relative min-h-screen flex items-center justify-center px-6 py-24 overflow-visible">
          <div ref={sliderRef} className="max-w-7xl mx-auto w-full overflow-visible">
            <CurvedSlider 
              items={items} 
              accentFrom="#00BFFF" 
              accentTo="#5CD6FF" 
              scrollProgress={cardScrollProgress}
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
