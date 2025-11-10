import { useState, useEffect, useRef } from 'react';

interface IconProps {
  position: { top?: string; bottom?: string; left?: string; right?: string };
  size?: number;
  delay?: number;
  iconIndex?: number;
}

// SVG file names from /public/svgs
const svgFiles = [
  'ppe-gloves.svg',
  'ppe-goggles.svg',
  'mobile-clinic.svg',
  'ppe-mask.svg',
  'bandage-adhesive.svg',
  'medicines.svg',
  'infusion-pump.svg',
  'cell-nuclei.svg',
  'dna.svg',
  'blood-drop.svg',
];

function LifeSciencesIcon({ position, size = 60, delay = 0, iconIndex = 0 }: IconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const svgFile = svgFiles[iconIndex % svgFiles.length];
  // Consistent rotation direction based on icon index (alternates between positive and negative)
  const rotationDeg = iconIndex % 2 === 0 ? '8deg' : '-8deg';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (iconRef.current) {
      observer.observe(iconRef.current);
    }

    return () => {
      if (iconRef.current) {
        observer.unobserve(iconRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={iconRef}
      className="absolute transition-all duration-700 ease-out"
      style={{
        ...position,
        width: `${size}px`,
        height: `${size}px`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? (isHovered 
              ? `translateY(-8px) scale(1.15) rotate(${rotationDeg})` 
              : 'translateY(0) scale(1) rotate(0deg)')
          : 'translateY(20px) scale(0.8) rotate(0deg)',
        transition: 'transform 0.3s ease-out, opacity 0.7s ease-out',
        pointerEvents: 'auto',
        cursor: 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={`/svgs/${svgFile}`}
        alt=""
        className="w-full h-full"
        style={{ 
          filter: 'brightness(0) invert(1)',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}

interface LifeSciencesIconsProps {
  count?: number;
  side?: 'left' | 'right' | 'both';
  size?: number;
}

export default function LifeSciencesIcons({ 
  count = 8, 
  side = 'both',
  size = 60 
}: LifeSciencesIconsProps) {
  // Simple seeded random for consistent positioning
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const positions: Array<{ top?: string; bottom?: string; left?: string; right?: string }> = [];
  const leftCount = side === 'left' ? count : side === 'right' ? 0 : Math.ceil(count / 2);
  const rightCount = side === 'right' ? count : side === 'left' ? 0 : Math.floor(count / 2);
  
  // Generate evenly spaced positions
  const generateEvenPositions = (count: number, isLeft: boolean) => {
    const newPositions: Array<{ top?: string; bottom?: string; left?: string; right?: string }> = [];
    
    if (count === 0) return newPositions;
    
    // Calculate even vertical spacing (from 8% to 92% to avoid edges)
    const startPercent = 8;
    const endPercent = 92;
    const totalRange = endPercent - startPercent;
    const spacing = count > 1 ? totalRange / (count - 1) : 0;
    
    for (let i = 0; i < count; i++) {
      const topPercent = count === 1 
        ? startPercent + totalRange / 2 // Center if only one icon
        : startPercent + (spacing * i);
      
      // Add slight horizontal variation (2-8% from edge)
      const horizontalOffset = seededRandom(i * (isLeft ? 7 : 11)) * 6 + 2;
      
      if (isLeft) {
        newPositions.push({
          left: `${horizontalOffset}%`,
          top: `${topPercent}%`,
        });
      } else {
        newPositions.push({
          right: `${horizontalOffset}%`,
          top: `${topPercent}%`,
        });
      }
    }
    
    return newPositions;
  };
  
  if (leftCount > 0) {
    positions.push(...generateEvenPositions(leftCount, true));
  }
  
  if (rightCount > 0) {
    positions.push(...generateEvenPositions(rightCount, false));
  }

  return (
    <>
      {positions.map((pos, index) => (
        <LifeSciencesIcon
          key={index}
          position={pos}
          size={size}
          delay={index * 100}
          iconIndex={index}
        />
      ))}
    </>
  );
}
