import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leftLabel: ReactNode;
  rightLabel: ReactNode;
  leftActive?: boolean;
  borderColor?: string; // Allow dynamic border color
  switchBgColor?: string; // Allow dynamic switch background color
  sliderColor?: string; // Allow dynamic slider color
  className?: string; // Allow custom className
}

export default function AnimatedSwitch({
  checked,
  onCheckedChange,
  leftLabel,
  rightLabel,
  leftActive = false,
  borderColor = 'var(--color-blue)',
  switchBgColor = 'white',
  sliderColor = 'var(--color-blue)',
  className = '',
}: AnimatedSwitchProps) {
  const isMobile = useIsMobile();
  const switchRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const leftLabelRef = useRef<HTMLSpanElement>(null);
  const rightLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sliderRef.current || !leftLabelRef.current || !rightLabelRef.current) return;

    const isChecked = leftActive ? !checked : checked;

    // Kill any running animations first to prevent conflicts
    gsap.killTweensOf([sliderRef.current, leftLabelRef.current, rightLabelRef.current]);

    // Use a timeline to synchronize all animations for smooth performance
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Animate the slider position with hardware acceleration
    tl.to(sliderRef.current, {
      x: isChecked ? "0%" : "100%",
      duration: 0.5,
      ease: "power2.out",
      force3D: true, // Force hardware acceleration
    }, 0);

    // Animate label emphasis simultaneously (keep both labels white)
    tl.to(leftLabelRef.current, {
      opacity: isChecked ? 1 : 0.5,
      duration: 0.4,
      ease: "power1.out",
    }, 0);

    tl.to(rightLabelRef.current, {
      opacity: isChecked ? 0.5 : 1,
      duration: 0.4,
      ease: "power1.out",
    }, 0);
  }, [checked, leftActive]);

  // Add hover animation for the switch container - desktop only
  useEffect(() => {
    if (isMobile) return; // Skip hover effects on mobile
    
    const switchContainer = switchRef.current?.querySelector('.switch-container') as HTMLElement;
    if (!switchContainer) return;

    const handleMouseEnter = () => {
      gsap.killTweensOf(switchContainer); // Kill any running animations
      gsap.to(switchContainer, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true // Force hardware acceleration
      });
    };

    const handleMouseLeave = () => {
      gsap.killTweensOf(switchContainer); // Kill any running animations
      gsap.to(switchContainer, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        force3D: true // Force hardware acceleration
      });
    };

    switchContainer.addEventListener('mouseenter', handleMouseEnter);
    switchContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      switchContainer.removeEventListener('mouseenter', handleMouseEnter);
      switchContainer.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(switchContainer); // Clean up on unmount
    };
  }, [isMobile]);

  return (
    <div 
      ref={switchRef}
      className={`relative flex items-center cursor-pointer flex-wrap justify-center ${className}`}
      style={{
        gap: isMobile ? 'clamp(16px, 4vw, 24px)' : '64px',
      }}
      onClick={() => onCheckedChange(!checked)}
    >
      <span 
        ref={leftLabelRef}
        className={`font-bold whitespace-normal text-center text-white leading-tight flex-1 ${isMobile ? 'text-[clamp(32px, 8vw, 48px)]' : 'text-7xl'}`}
        style={{ 
          minWidth: isMobile ? '0' : '400px', 
          maxWidth: isMobile ? '100%' : '600px',
          willChange: 'opacity',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        {leftLabel}
      </span>
      
      <div 
        className="switch-container relative rounded-full overflow-hidden shadow-inner flex-shrink-0" 
        style={{ 
          width: isMobile ? 'clamp(80px, 20vw, 120px)' : '160px',
          height: isMobile ? 'clamp(40px, 10vw, 60px)' : '80px',
          borderWidth: isMobile ? '3px' : '4px',
          borderColor, 
          backgroundColor: switchBgColor,
          willChange: 'transform',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <div
          ref={sliderRef}
          className="absolute top-0 left-0 w-1/2 h-full rounded-full"
          style={{ 
            backgroundColor: sliderColor,
            willChange: 'transform',
            transform: 'translateZ(0)' // Force hardware acceleration
          }}
        />
      </div>
      
      <span 
        ref={rightLabelRef}
        className={`font-bold whitespace-normal text-center text-white leading-tight flex-1 ${isMobile ? 'text-[clamp(32px, 8vw, 48px)]' : 'text-7xl'}`}
        style={{ 
          minWidth: isMobile ? '0' : '400px', 
          maxWidth: isMobile ? '100%' : '600px',
          willChange: 'opacity',
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        {rightLabel}
      </span>
    </div>
  );
}

