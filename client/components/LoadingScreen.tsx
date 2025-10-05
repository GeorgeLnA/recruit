import { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

type Phase = 'count' | 'exit';

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('count');
  const rafIdRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

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

  const isCounting = phase === 'count';
  const isExiting = phase === 'exit';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: '#FF914D',
        transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
      }}
    >
      {/* Content container */}
      <div className="relative w-full max-w-[1600px] px-8">
        {/* Reserve space to prevent layout shift for percentage */}
        <div className="text-center mb-6 select-none">
          {/* Invisible width-reserver ensures stable layout */}
          <div
            className="invisible text-[360px] font-bold leading-none"
            style={{ fontFamily: 'Milker' }}
          >
            100%
          </div>

          {/* Animated percentage overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-[360px] font-bold leading-none transition-all duration-1000 ease-out"
              style={{
                fontFamily: 'Milker',
                color: '#FF3A34',
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
