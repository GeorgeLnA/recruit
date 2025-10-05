import { useEffect, useRef, useState } from 'react';

interface MobileMessageProps {
  onMobileDetected?: () => void;
}

export default function MobileMessage({ onMobileDetected }: MobileMessageProps) {
  const [isMobile, setIsMobile] = useState(() => {
    // Initial check for SSR safety
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      // More comprehensive mobile detection
      const isMobileWidth = window.innerWidth < 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isMobileDevice = isMobileWidth || (isTouchDevice && window.innerWidth < 1024);
      
      const wasMobile = isMobile;
      setIsMobile(isMobileDevice);
      
      // Only call onMobileDetected once when switching to mobile
      if (isMobileDevice && !wasMobile && !hasNotifiedRef.current && onMobileDetected) {
        hasNotifiedRef.current = true;
        onMobileDetected();
      }
      
      // Reset notification flag when switching back to desktop
      if (!isMobileDevice && wasMobile) {
        hasNotifiedRef.current = false;
      }
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [onMobileDetected, isMobile]);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-[#FF914D] z-[9999] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        {/* Oops Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#FF3A34] flex items-center justify-center">
            <span className="text-white text-4xl font-bold" style={{fontFamily: 'Milker'}}>
              !
            </span>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-[48px] font-bold text-[#FF3A34] mb-6" style={{fontFamily: 'Milker'}}>
          Oops!
        </h1>
        
        <p className="text-[20px] text-[#FF3A34] font-semibold leading-relaxed mb-8">
          Sorry, we're still in development. Please check us out from your desktop for the full experience!
        </p>

        {/* Desktop Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#FF3A34] rounded-lg flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-32 h-32 rounded-full bg-white/10 animate-pulse"
          style={{
            top: '20%',
            left: '10%',
            animationDelay: '0s',
            animationDuration: '2s'
          }}
        />
        <div 
          className="absolute w-24 h-24 rounded-full bg-white/10 animate-pulse"
          style={{
            top: '60%',
            right: '15%',
            animationDelay: '1s',
            animationDuration: '2.5s'
          }}
        />
        <div 
          className="absolute w-16 h-16 rounded-full bg-white/10 animate-pulse"
          style={{
            bottom: '20%',
            left: '20%',
            animationDelay: '0.5s',
            animationDuration: '3s'
          }}
        />
      </div>
    </div>
  );
}
