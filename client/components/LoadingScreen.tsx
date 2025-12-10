import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LoadingScreenProps {
  onComplete: () => void;
}

const DELAY_MS = 300;
const morphTime = 1.2;
const cdcGlobalHoldTime = 1000;
const COUNT_DURATION_MS = 3600 - DELAY_MS;

// State machine for word transitions
type WordState = 
  | { type: 'CDMO' }
  | { type: 'Diagnostics' }
  | { type: 'CRO' }
  | { type: 'CDC_Global' }
  | { type: 'EXIT' };

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState(0);
  const [wordState, setWordState] = useState<WordState>({ type: 'CDMO' });
  
  const rafIdRef = useRef<number | null>(null);
  const morphRafIdRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const lastTimeRef = useRef(performance.now());
  const morphProgressRef = useRef(0);
  const cdcGlobalShownRef = useRef(false);
  const isExitingRef = useRef(false);
  const currentStateRef = useRef<WordState>({ type: 'CDMO' }); // Synchronous state tracking

  // Word mapping - with line break for mobile
  const wordText: Record<WordState['type'], string> = {
    'CDMO': 'CDMO',
    'Diagnostics': 'Diagnostics',
    'CRO': 'CRO',
    'CDC_Global': isMobile ? 'CDC\nGlobal' : 'CDC Global',
    'EXIT': isMobile ? 'CDC\nGlobal' : 'CDC Global'
  };

  // Get next state in sequence
  const getNextState = (current: WordState): WordState => {
    switch (current.type) {
      case 'CDMO': return { type: 'Diagnostics' };
      case 'Diagnostics': return { type: 'CRO' };
      case 'CRO': return { type: 'CDC_Global' };
      case 'CDC_Global': return { type: 'EXIT' };
      default: return current;
    }
  };

  // Progress counter
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    setTimeout(() => {
      const start = performance.now();
      
      const tick = (now: number) => {
        const elapsed = now - start;
        const ratio = Math.min(elapsed / COUNT_DURATION_MS, 1);
        setProgress(Math.round(ratio * 100));
        
        if (ratio < 1) {
          rafIdRef.current = requestAnimationFrame(tick);
        }
      };
      
      rafIdRef.current = requestAnimationFrame(tick);
    }, DELAY_MS);
    
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Initialize text elements
  useEffect(() => {
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = wordText['CDMO'];
      text1Ref.current.style.filter = 'blur(0px)';
      text1Ref.current.style.opacity = '100%';
      
      text2Ref.current.textContent = wordText['Diagnostics'];
      text2Ref.current.style.filter = 'blur(8px)';
      text2Ref.current.style.opacity = '0%';
    }
    currentStateRef.current = { type: 'CDMO' };
  }, [isMobile]);

  // Sync state ref with state
  useEffect(() => {
    currentStateRef.current = wordState;
  }, [wordState]);

  // Main morph animation - single source of truth using ref for synchronous access
  useEffect(() => {
    if (isExitingRef.current || currentStateRef.current.type === 'EXIT') {
      if (morphRafIdRef.current) {
        cancelAnimationFrame(morphRafIdRef.current);
        morphRafIdRef.current = null;
      }
      return;
    }

    const animate = () => {
      // Use ref for synchronous state access - avoids race conditions
      const currentState = currentStateRef.current;
      
      if (isExitingRef.current || currentState.type === 'EXIT') {
        if (morphRafIdRef.current) {
          cancelAnimationFrame(morphRafIdRef.current);
          morphRafIdRef.current = null;
        }
        return;
      }

      const now = performance.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Handle CDC Global state - lock and exit
      if (currentState.type === 'CDC_Global') {
        if (text1Ref.current && text2Ref.current) {
          const cdcText = wordText['CDC_Global'];
          text1Ref.current.textContent = cdcText;
          text2Ref.current.textContent = cdcText;
          text1Ref.current.style.filter = 'blur(0px)';
          text1Ref.current.style.opacity = '0%';
          text2Ref.current.style.filter = 'blur(0px)';
          text2Ref.current.style.opacity = '100%';
        }
        
        if (!cdcGlobalShownRef.current) {
          cdcGlobalShownRef.current = true;
          setTimeout(() => {
            if (text1Ref.current && text2Ref.current) {
              const cdcText = wordText['CDC_Global'];
              text1Ref.current.textContent = cdcText;
              text2Ref.current.textContent = cdcText;
              text1Ref.current.style.filter = 'blur(0px)';
              text1Ref.current.style.opacity = '0%';
              text2Ref.current.style.filter = 'blur(0px)';
              text2Ref.current.style.opacity = '100%';
            }
            isExitingRef.current = true;
            currentStateRef.current = { type: 'EXIT' };
            setWordState({ type: 'EXIT' });
            setTimeout(() => {
              onComplete();
            }, 1000);
          }, cdcGlobalHoldTime);
        }
        return;
      }

      // Continue morphing - use ref for synchronous state
      const currentText = currentState.type === 'CDC_Global' || currentState.type === 'EXIT' 
        ? (isMobile ? 'CDC\nGlobal' : 'CDC Global')
        : wordText[currentState.type];
      const nextState = getNextState(currentState);
      const nextText = nextState.type === 'CDC_Global' || nextState.type === 'EXIT'
        ? (isMobile ? 'CDC\nGlobal' : 'CDC Global')
        : wordText[nextState.type];

      // CRITICAL: Always ensure text2 is set to next word BEFORE any morph happens
      // This prevents any flash of wrong text
      if (text2Ref.current) {
        if (text2Ref.current.textContent !== nextText) {
          text2Ref.current.textContent = nextText;
          text2Ref.current.style.filter = 'blur(8px)';
          text2Ref.current.style.opacity = '0%';
        }
      }

      // Ensure text1 shows current word
      if (text1Ref.current && text1Ref.current.textContent !== currentText) {
        text1Ref.current.textContent = currentText;
      }

      morphProgressRef.current += deltaTime / morphTime;
      
      if (morphProgressRef.current >= 1) {
        // Morph complete - swap and advance state
        if (text1Ref.current && text2Ref.current) {
          // Swap: text1 gets the morphed word (nextText)
          text1Ref.current.textContent = nextText;
          text1Ref.current.style.filter = 'blur(0px)';
          text1Ref.current.style.opacity = '100%';
          
          // Prepare text2 for next morph - calculate from nextState, not currentState
          const nextNextState = getNextState(nextState);
          const nextNextText = nextNextState.type === 'CDC_Global' || nextNextState.type === 'EXIT'
            ? (isMobile ? 'CDC\nGlobal' : 'CDC Global')
            : wordText[nextNextState.type];
          
          // CRITICAL: Set text2 immediately and ensure it's correct
          text2Ref.current.textContent = nextNextText;
          text2Ref.current.style.filter = 'blur(8px)';
          text2Ref.current.style.opacity = '0%';
        }
        
        morphProgressRef.current = 0;
        // Update both ref and state synchronously
        currentStateRef.current = nextState;
        setWordState(nextState);
      } else {
        // Apply morph effect
        const fraction = Math.min(morphProgressRef.current, 1);
        
        if (text1Ref.current && text2Ref.current) {
          // Continuously verify content is correct during morph
          if (text1Ref.current.textContent !== currentText) {
            text1Ref.current.textContent = currentText;
          }
          // CRITICAL: Always ensure text2 shows nextText during morph
          if (text2Ref.current.textContent !== nextText) {
            text2Ref.current.textContent = nextText;
          }

          const blur1 = Math.min(8 / (1 - fraction) - 8, 100);
          const blur2 = Math.min(8 / fraction - 8, 100);
          const opacity1 = Math.pow(1 - fraction, 0.4) * 100;
          const opacity2 = Math.pow(fraction, 0.4) * 100;

          text1Ref.current.style.filter = `blur(${blur1}px)`;
          text1Ref.current.style.opacity = `${opacity1}%`;
          text2Ref.current.style.filter = `blur(${blur2}px)`;
          text2Ref.current.style.opacity = `${opacity2}%`;
        }
      }

      if (!isExitingRef.current && currentStateRef.current.type !== 'EXIT') {
        morphRafIdRef.current = requestAnimationFrame(animate);
      }
    };

    morphRafIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (morphRafIdRef.current) {
        cancelAnimationFrame(morphRafIdRef.current);
        morphRafIdRef.current = null;
      }
    };
  }, [wordState, isMobile]);

  // Safety check: Prevent wrong text from appearing during transitions
  useEffect(() => {
    if (isExitingRef.current) return;
    
    const safetyCheck = () => {
      const currentState = currentStateRef.current;
      
      if (currentState.type === 'EXIT' || isExitingRef.current) {
        if (text1Ref.current && text2Ref.current) {
          const cdcText = isMobile ? 'CDC\nGlobal' : 'CDC Global';
          if (text1Ref.current.textContent !== cdcText) {
            text1Ref.current.textContent = cdcText;
          }
          if (text2Ref.current.textContent !== cdcText) {
            text2Ref.current.textContent = cdcText;
          }
        }
        return;
      }

      // When at CRO or transitioning to CDC Global, ensure text2 is NEVER Diagnostics
      if (currentState.type === 'CRO' || currentState.type === 'CDC_Global') {
        if (text2Ref.current) {
          const expectedText = isMobile ? 'CDC\nGlobal' : 'CDC Global';
          // If text2 shows Diagnostics when it shouldn't, fix it immediately
          if (text2Ref.current.textContent === wordText['Diagnostics']) {
            text2Ref.current.textContent = expectedText;
            text2Ref.current.style.filter = 'blur(8px)';
            text2Ref.current.style.opacity = '0%';
          }
        }
      }

      // Ensure text2 always shows the correct next word based on current state
      if (text2Ref.current && currentState.type !== 'CDC_Global' && currentState.type !== 'EXIT') {
        const nextState = getNextState(currentState);
        const expectedNextText = wordText[nextState.type];
        if (text2Ref.current.textContent !== expectedNextText && 
            text2Ref.current.style.opacity === '0%') {
          // Only update if text2 is hidden (not during active morph)
          text2Ref.current.textContent = expectedNextText;
        }
      }
    };

    const interval = setInterval(safetyCheck, 16); // Check every frame (~60fps)
    
    return () => clearInterval(interval);
  }, [wordState, isMobile]);

  // Lock text during exit
  useEffect(() => {
    if (wordState.type === 'EXIT' && text1Ref.current && text2Ref.current) {
      const lockText = () => {
        if (text1Ref.current && text2Ref.current) {
          const cdcText = isMobile ? 'CDC\nGlobal' : 'CDC Global';
          text1Ref.current.textContent = cdcText;
          text2Ref.current.textContent = cdcText;
          text1Ref.current.style.filter = 'none';
          text1Ref.current.style.opacity = '0%';
          text2Ref.current.style.filter = 'none';
          text2Ref.current.style.opacity = '100%';
        }
      };
      
      lockText();
      const interval = setInterval(lockText, 8);
      
      return () => clearInterval(interval);
    }
  }, [wordState, isMobile]);

  // Simple mobile loading screen
  const [mobileExiting, setMobileExiting] = useState(false);
  
  useEffect(() => {
    if (isMobile) {
      // Show for 1.5 seconds then slide up
      const timer = setTimeout(() => {
        setMobileExiting(true);
        setTimeout(() => {
          onComplete();
        }, 1000); // Wait for slide animation
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isMobile, onComplete]);

  const isCounting = wordState.type !== 'EXIT';
  const isExiting = wordState.type === 'EXIT';

  // Simple mobile version
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-peach)',
          transform: mobileExiting ? 'translateY(-100%)' : 'translateY(0%)',
          transition: 'transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
          zIndex: 2147483650
        }}
      >
        <div className="text-center">
          <h1
            className="font-bold text-center"
            style={{
              color: 'var(--color-blue)',
              fontSize: 'clamp(48px, 12vw, 80px)',
              fontFamily: 'TexGyreAdventor',
              whiteSpace: 'pre-line',
              lineHeight: '1.2',
            }}
          >
            CDC{'\n'}Global
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-peach)',
        transform: isExiting ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 1000ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
        zIndex: 2147483650
      }}
    >
      <div className="relative w-full max-w-[1600px] px-8 flex flex-col items-center justify-center">
        <div 
          className="text-center mb-16 select-none relative flex items-center justify-center" 
          style={{ 
            height: isMobile ? 'clamp(100px, 20vw, 160px)' : 'clamp(120px, 15vw, 240px)',
            filter: isCounting ? 'url(#threshold) blur(0.6px)' : 'none',
            opacity: 1,
            transform: 'translateY(0px)',
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
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-center font-bold leading-none"
            ref={text1Ref}
            style={{
              color: 'var(--color-blue)',
              fontSize: isMobile ? 'clamp(48px, 10vw, 80px)' : 'clamp(100px, 12vw, 220px)',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textTransform: 'none',
              letterSpacing: 'normal',
              whiteSpace: isMobile ? 'pre-line' : 'nowrap',
              lineHeight: isMobile ? '1.1' : '1',
            }}
          />
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 inline-block text-center font-bold leading-none"
            ref={text2Ref}
            style={{
              color: 'var(--color-blue)',
              fontSize: isMobile ? 'clamp(48px, 10vw, 80px)' : 'clamp(100px, 12vw, 220px)',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              fontStyle: 'normal',
              textTransform: 'none',
              letterSpacing: 'normal',
              whiteSpace: isMobile ? 'pre-line' : 'nowrap',
              lineHeight: isMobile ? '1.1' : '1',
            }}
          />
        </div>

        <div className="text-center select-none relative">
          <div
            className="invisible font-bold leading-none"
            style={{ 
              fontSize: isMobile ? 'clamp(20px, 5vw, 40px)' : 'clamp(30px, 8vw, 120px)'
            }}
          >
            100%
          </div>

          <div className="absolute inset-0 flex items-center justify-center md:justify-center" style={{ paddingLeft: 'clamp(20px, 5vw, 0px)' }}>
            <div
              className="font-bold leading-none transition-all duration-1000 ease-out"
              style={{
                color: 'var(--color-blue)',
                fontSize: isMobile ? 'clamp(20px, 5vw, 40px)' : 'clamp(30px, 8vw, 120px)',
                fontVariantNumeric: 'tabular-nums',
                // @ts-ignore
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
