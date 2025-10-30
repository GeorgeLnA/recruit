import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface AnimatedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  leftLabel: ReactNode;
  rightLabel: ReactNode;
  leftActive?: boolean;
}

export default function AnimatedSwitch({
  checked,
  onCheckedChange,
  leftLabel,
  rightLabel,
  leftActive = false,
}: AnimatedSwitchProps) {
  const switchRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const leftLabelRef = useRef<HTMLSpanElement>(null);
  const rightLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sliderRef.current || !leftLabelRef.current || !rightLabelRef.current) return;

    const isChecked = leftActive ? !checked : checked;

    // Animate the slider position
    gsap.to(sliderRef.current, {
      x: isChecked ? "0%" : "100%",
      duration: 0.6,
      ease: "power2.out",
    });

    // Animate label emphasis (keep both labels white)
    gsap.to(leftLabelRef.current, {
      opacity: isChecked ? 1 : 0.5,
      color: "white",
      duration: 0.4,
      ease: "power1.out",
    });

    gsap.to(rightLabelRef.current, {
      opacity: isChecked ? 0.5 : 1,
      color: "white",
      duration: 0.4,
      ease: "power1.out",
    });
  }, [checked, leftActive]);

  return (
    <div 
      ref={switchRef}
      className="relative flex items-center cursor-pointer gap-12 flex-wrap justify-center"
      onClick={() => onCheckedChange(!checked)}
    >
      <span 
        ref={leftLabelRef}
        className="text-6xl font-bold transition-colors whitespace-normal text-center text-white" 
        style={{ fontFamily: 'Milker' }}
      >
        {leftLabel}
      </span>
      
      <div className="relative w-32 h-16 bg-white rounded-full border-4 border-gray-300 overflow-hidden shadow-inner flex-shrink-0">
        <div
          ref={sliderRef}
          className="absolute top-0 left-0 w-1/2 h-full bg-[#ff3a34] rounded-full transition-transform duration-600 ease-out will-change-transform"
        />
      </div>
      
      <span 
        ref={rightLabelRef}
        className="text-6xl font-bold transition-colors whitespace-normal text-center text-white" 
        style={{ fontFamily: 'Milker' }}
      >
        {rightLabel}
      </span>
    </div>
  );
}

