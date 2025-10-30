import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, gsapUtils } from "@/lib/gsap";

export default function GSAPExample() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(() => {
    // Initial setup - hide elements
    gsap.set([titleRef.current, ...cardsRef.current], { opacity: 0, y: 50 });

    // Create timeline for coordinated animations
    const tl = gsap.timeline();

    // Animate title
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    });

    // Animate cards with stagger
    tl.to(cardsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out"
    }, "-=0.4");

  }, { scope: containerRef });

  // Hover animations
  const handleCardHover = (index: number) => {
    gsap.to(cardsRef.current[index], {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardLeave = (index: number) => {
    gsap.to(cardsRef.current[index], {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  return (
    <div ref={containerRef} className="p-8 bg-gray-50 min-h-screen">
      <h1 
        ref={titleRef}
        className="text-4xl font-bold text-center mb-12 text-white"
      >
        GSAP Animation Example
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[1, 2, 3].map((item, index) => (
          <div
            key={item}
            ref={(el) => {
              if (el) cardsRef.current[index] = el;
            }}
            onMouseEnter={() => handleCardHover(index)}
            onMouseLeave={() => handleCardLeave(index)}
            className="bg-white p-6 rounded-lg shadow-lg cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-4">Card {item}</h3>
            <p className="text-white">
              This card demonstrates GSAP animations with hover effects.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

