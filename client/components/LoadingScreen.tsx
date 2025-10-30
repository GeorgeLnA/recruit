import { useCallback, useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

type Phase = 'count' | 'exit';

const morphTime = 1.5;
const cooldownTime = 0.5;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('count');
  const rafIdRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  
  const words = ['CDMO', 'CRO', 'Diagnostics'];
  
  // Morphing text refs and logic
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Prevent multiple starts
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const COUNT_DURATION_MS = 3000; // 0 -> 100%
    const HOLD_DURATION_MS = 1000;  // hold at 100%
    const EXIT_DURATION_MS = 1000;  // quicker slide-out

    // Phase 1: smooth count using rAF
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / COUNT_DURATION_MS, 1);
      const next = Math.round(ratio * 100);
      setProgress(next);
      if (ratio < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // Hold at 100% for 1 second, then exit
        setTimeout(() => {
          setPhase('exit');
          setTimeout(() => {
            onComplete();
          }, EXIT_DURATION_MS);
        }, HOLD_DURATION_MS);
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      // Stop morphing when we reach the last word (CRO)
      if (textIndexRef.current >= words.length - 1) {
        current2.style.filter = 'none';
        current2.style.opacity = '100%';
        current1.style.filter = 'none';
        current1.style.opacity = '0%';
        current1.textContent = words[words.length - 1];
        current2.textContent = words[words.length - 1];
        return;
      }

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = words[textIndexRef.current % words.length];
      current2.textContent = words[(textIndexRef.current + 1) % words.length];
    },
    [words],
  );

  const doMorph = useCallback(() => {
    const newTime = new Date();
    const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
    timeRef.current = newTime;
    
    morphRef.current += dt;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1 && textIndexRef.current < words.length - 1) {
      textIndexRef.current++;
      morphRef.current = 0;
    }
  }, [setStyles, words.length]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = 'none';
      current2.style.opacity = '100%';
      current1.style.filter = 'none';
      current1.style.opacity = '0%';
    }
  }, []);

  // Initialize text content
  useEffect(() => {
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = words[0];
      text2Ref.current.textContent = words[1] || words[0];
      text2Ref.current.style.filter = 'none';
      text2Ref.current.style.opacity = '100%';
      text1Ref.current.style.filter = 'none';
      text1Ref.current.style.opacity = '0%';
    }
  }, []);

  // Morphing text animation
  useEffect(() => {
    if (phase === 'exit') return;
    
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      cooldownRef.current -= 0.016; // Approximate 60fps delta

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, doMorph, doCooldown]);

  const isCounting = phase === 'count';
  const isExiting = phase === 'exit';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: '#FF914D',
        transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
        zIndex: 2147483650 // Above Header's highest z-index (2147483649)
      }}
    >
      {/* Content container */}
      <div className="relative w-full max-w-[1600px] px-8 flex flex-col items-center justify-center">
        {/* Morphing words on top */}
        <div 
          className="text-center mb-16 select-none relative flex items-center justify-center" 
          style={{ 
            height: 'clamp(120px, 15vw, 240px)',
            filter: isCounting ? 'url(#threshold) blur(0.6px)' : 'none',
            opacity: isCounting ? 1 : 0,
            transform: isCounting ? 'translateY(0px)' : 'translateY(-40px)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
          }}
        >
          <svg id="filters" className="hidden" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="threshold">
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values="1 0 0 0 0
                          0 1 0 0 0
                          0 0 1 0 0
                          0 0 0 255 -140"
                />
              </filter>
            </defs>
          </svg>
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-center font-bold leading-none whitespace-nowrap"
            ref={text1Ref}
            style={{
              fontFamily: 'Milker',
              color: '#FF3A34',
              fontSize: 'clamp(100px, 12vw, 220px)',
            }}
          />
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-center font-bold leading-none whitespace-nowrap"
            ref={text2Ref}
            style={{
              fontFamily: 'Milker',
              color: '#FF3A34',
              fontSize: 'clamp(100px, 12vw, 220px)',
            }}
          />
        </div>

        {/* Percentage display - moved lower */}
        <div className="text-center select-none relative">
          {/* Invisible width-reserver ensures stable layout */}
          <div
            className="invisible font-bold leading-none"
            style={{ 
              fontFamily: 'Milker',
              fontSize: 'clamp(80px, 8vw, 120px)'
            }}
          >
            100%
          </div>

          {/* Animated percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="font-bold leading-none transition-all duration-1000 ease-out"
              style={{
                fontFamily: 'Milker',
                color: '#FF3A34',
                fontSize: 'clamp(80px, 8vw, 120px)',
                fontVariantNumeric: 'tabular-nums',
                // @ts-ignore - vendor property not in TS CSS types
                fontFeatureSettings: '"tnum" 1',
                transform: isCounting ? 'translateY(0px)' : 'translateY(-120px)',
                opacity: isCounting ? 1 : 0,
                transition: 'transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1000ms ease-out'
              }}
            >
              {progress}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
