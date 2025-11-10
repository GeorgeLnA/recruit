import { useEffect, useState } from 'react';

export default function ScrollTracker() {
  const [scrollPercentage, setScrollPercentage] = useState(0);

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

  return (
    <div className="fixed top-1/2 transform -translate-y-1/2 z-50 pointer-events-none" style={{ right: '32px' }}>
      <div className="flex flex-col items-center space-y-3">
        {/* Percentage display - matching loading screen style */}
        <div className="relative">
          {/* Background circle with brand colors */}
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#00BFFF' }}
          >
            <div 
              className="text-white font-bold text-base"
              style={{ 
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
              className="absolute inset-0 rounded-full border-3 border-brand-orange border-t-transparent transition-all duration-200 ease-out"
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
