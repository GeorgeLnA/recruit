import { useEffect, useState, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function ScrollTracker() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = Math.round((scrollTop / docHeight) * 100);
      setScrollPercentage(Math.min(Math.max(percentage, 0), 100));
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hover expand animation
  useEffect(() => {
    const counter = counterRef.current;
    if (!counter) return;

    const handleMouseEnter = () => {
      gsap.to(counter, {
        scale: 1.3,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(counter, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    counter.addEventListener('mouseenter', handleMouseEnter);
    counter.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      counter.removeEventListener('mouseenter', handleMouseEnter);
      counter.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 z-50 pointer-events-none" style={{ right: 'clamp(16px, 4vw, 32px)' }}>
      <div className="flex flex-col items-center space-y-3">
        {/* Percentage display - matching loading screen style */}
        <div 
          ref={counterRef}
          className="relative pointer-events-auto cursor-pointer"
        >
          {/* Background circle with brand colors */}
          <div 
            className="rounded-full flex items-center justify-center shadow-lg bg-[var(--color-blue)]"
            style={{ 
              width: 'clamp(48px, 6vw, 64px)',
              height: 'clamp(48px, 6vw, 64px)'
            }}
          >
            <div 
              className="text-white font-bold"
              style={{ 
                fontSize: 'clamp(12px, 1.5vw, 16px)',
                fontVariantNumeric: 'tabular-nums',
                // @ts-ignore - vendor property not in TS CSS types
                fontFeatureSettings: '"tnum" 1'
              }}
            >
              {scrollPercentage}%
            </div>
          </div>
          
          {/* Progress ring with brand orange */}
          <div className="absolute inset-0 rounded-full border-3 border-white/20">
            <div 
              className="absolute inset-0 rounded-full border-3 border-[var(--color-peach)] border-t-transparent transition-all duration-200 ease-out"
              style={{
                transform: `rotate(${(scrollPercentage / 100) * 360 - 90}deg)`,
                transformOrigin: 'center'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
