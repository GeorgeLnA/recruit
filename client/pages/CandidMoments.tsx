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
  const titleRef = useRef<HTMLHeadingElement>(null);
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
        title: "text", 
        imageUrl: "/Adam and Harriet 3.jpg", 
        backImageUrl: "/IMG_0191.JPG",
        description: "text" 
      },
      { 
        id: "02", 
        number: "02", 
        title: "text", 
        imageUrl: "/Adam Headshot 4.jpg", 
        backImageUrl: "/IMG_4193.jpeg",
        description: "text" 
      },
      { 
        id: "03", 
        number: "03", 
        title: "text", 
        imageUrl: "/Harriet Headshot 8.jpg", 
        backImageUrl: "/IMG_1198.jpeg",
        description: "text" 
      },
      { 
        id: "04", 
        number: "04", 
        title: "text", 
        imageUrl: "/Adam and Harriet 3.jpg", 
        backImageUrl: "/IMG_0191.JPG",
        description: "text" 
      },
      { 
        id: "05", 
        number: "05", 
        title: "text", 
        imageUrl: "/Adam Headshot 4.jpg", 
        backImageUrl: "/IMG_4193.jpeg",
        description: "text" 
      },
      { 
        id: "06", 
        number: "06", 
        title: "text", 
        imageUrl: "/Harriet Headshot 8.jpg", 
        backImageUrl: "/IMG_1198.jpeg",
        description: "text" 
      },
      { 
        id: "07", 
        number: "07", 
        title: "text", 
        imageUrl: "/Adam and Harriet 3.jpg", 
        backImageUrl: "/IMG_0191.JPG",
        description: "text" 
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
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
          once: true
        }
      });
    }

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
  }, {});

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
        className="relative pt-48 px-6 overflow-hidden" 
        style={{ backgroundColor: '#FF914D' }}
      >
        <AmbientOrbs tone="peach" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 
              ref={titleRef}
              className="text-8xl font-bold mb-16 text-center text-white" 
              style={{ fontFamily: 'Milker' }}
            >
              Candid Moments
            </h1>
          </div>
        </div>
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
              accentFrom="#ff3a34" 
              accentTo="#ff6b66" 
              scrollProgress={cardScrollProgress}
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

