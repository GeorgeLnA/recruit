import { useCallback, useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

type Phase = 'count' | 'exit';
type AnimationType = 'morph' | 'stack';

const morphTime = 1.5;
const cooldownTime = 0.5;

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('count');
  
  // Load animation type from localStorage or default to 'morph'
  const [animationType, setAnimationType] = useState<AnimationType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('loadingAnimationType');
      return (saved === 'morph' || saved === 'stack') ? saved : 'morph';
    }
    return 'morph';
  });
  
  const rafIdRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  
  const words = ['CDMO', 'CRO', 'Diagnostics'];
  const stackWords = ['CDMO', 'Diagnostics', 'CRO']; // Order: CDMO -> Diagnostics -> CRO (spells CDC)
  
  // Morphing text refs and logic
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  
  // Stack animation state
  const [visibleWords, setVisibleWords] = useState<number[]>([]);
  const stackAnimationRef = useRef<number | null>(null);
  const currentWordIndexRef = useRef<number>(0);

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

  // Stack animation effect
  useEffect(() => {
    if (animationType !== 'stack' || phase === 'exit') {
      // Clear any pending timeouts if not in stack mode
      if (stackAnimationRef.current) {
        clearTimeout(stackAnimationRef.current);
        stackAnimationRef.current = null;
      }
      return;
    }
    
    // Reset visible words and index when starting stack animation
    setVisibleWords([]);
    currentWordIndexRef.current = 0;
    
    // Clear any existing timeout
    if (stackAnimationRef.current) {
      clearTimeout(stackAnimationRef.current);
      stackAnimationRef.current = null;
    }
    
    const WORD_DELAY = 600; // Consistent delay between each word appearing
    
    const showNextWord = () => {
      const currentIndex = currentWordIndexRef.current;
      if (currentIndex >= stackWords.length) {
        return; // All words shown
      }
      
      // Show the current word
      setVisibleWords(prev => {
        // Add the current index if not already present
        if (!prev.includes(currentIndex)) {
          return [...prev, currentIndex].sort((a, b) => a - b);
        }
        return prev;
      });
      
      // Move to next word
      currentWordIndexRef.current = currentIndex + 1;
      
      // Schedule next word if there are more
      if (currentWordIndexRef.current < stackWords.length) {
        stackAnimationRef.current = window.setTimeout(showNextWord, WORD_DELAY);
      } else {
        stackAnimationRef.current = null;
      }
    };
    
    // Start showing words immediately
    showNextWord();
    
    return () => {
      if (stackAnimationRef.current) {
        clearTimeout(stackAnimationRef.current);
        stackAnimationRef.current = null;
      }
    };
  }, [animationType, phase, stackWords.length]);

  // Reset visible words when switching FROM stack TO morph
  useEffect(() => {
    if (animationType === 'morph') {
      setVisibleWords([]);
    }
  }, [animationType]);

  // Morphing text animation
  useEffect(() => {
    if (animationType !== 'morph' || phase === 'exit') return;
    
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
  }, [animationType, phase, doMorph, doCooldown]);

  const isCounting = phase === 'count';
  const isExiting = phase === 'exit';

  // Helper function to render word (no shine effect)
  const renderWord = (word: string, index: number, isVisible: boolean) => {
    return (
      <span
        className="inline-block font-bold leading-none whitespace-nowrap"
        style={{
          color: '#00BFFF',
          fontSize: 'clamp(100px, 12vw, 220px)',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0px)' : 'translateY(-30px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          willChange: 'opacity, transform'
        }}
      >
        {word}
      </span>
    );
  };

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
      {/* Toggle Switch - Top Right */}
      <div
        className="absolute top-6 right-6 z-50 flex items-center gap-2"
        style={{ pointerEvents: 'auto' }}
      >
        <span style={{ fontSize: '12px', color: '#00BFFF', fontWeight: 'bold' }}>
          {animationType === 'morph' ? 'Morph' : 'Stack'}
        </span>
        <button
          onClick={() => {
            const newType = animationType === 'morph' ? 'stack' : 'morph';
            setAnimationType(newType);
            localStorage.setItem('loadingAnimationType', newType);
          }}
          className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-colors"
          style={{ fontFamily: 'TexGyreAdventor' }}
        >
          Switch
        </button>
      </div>


      {/* Content container */}
      <div className="relative w-full max-w-[1600px] px-8 flex flex-col items-center justify-center">
        {/* Animation container */}
        {animationType === 'morph' ? (
          /* Morphing words animation */
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
                color: '#00BFFF',
                fontSize: 'clamp(100px, 12vw, 220px)',
              }}
            />
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-center font-bold leading-none whitespace-nowrap"
              ref={text2Ref}
              style={{
                color: '#00BFFF',
                fontSize: 'clamp(100px, 12vw, 220px)',
              }}
            />
          </div>
        ) : (
          /* Stack animation - words appearing one on top of the other */
          <div 
            className="text-center mb-16 select-none relative flex flex-wrap items-center justify-center gap-8" 
            style={{ 
              minHeight: 'clamp(160px, 24vw, 360px)',
              opacity: isCounting ? 1 : 0,
              transform: isCounting ? 'translateY(0px)' : 'translateY(-40px)',
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
            }}
          >
            {stackWords.map((word, index) => {
              const isVisible = visibleWords.includes(index);
              
              return (
                <span
                  key={`stack-word-${index}`}
                  className="inline-flex items-center gap-6"
                >
                  {renderWord(word, index, isVisible)}
                </span>
              );
            })}
          </div>
        )}

        {/* Percentage display - moved lower */}
        <div className="text-center select-none relative">
          {/* Invisible width-reserver ensures stable layout */}
          <div
            className="invisible font-bold leading-none"
            style={{ 
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
                color: '#00BFFF',
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
};

export default LoadingScreen;
