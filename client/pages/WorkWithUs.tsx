import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import VideoPlayer from "@/components/VideoPlayer";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { Hand } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function WorkWithUs() {
  // Helper function to get checked state from hash
  const getCheckedFromHash = () => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#candidate';
  };
  
  const [checked, setChecked] = useState(() => getCheckedFromHash());
  const clientPanelRef = useRef<HTMLDivElement>(null);
  const candidatePanelRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const clientCardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const candidateCardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const lastScrollYRef = useRef(0);
  const lastCandidateScrollYRef = useRef(0);
  const [clientCardProgress, setClientCardProgress] = useState<number[]>([0, 0, 0, 0]);
  const [candidateCardProgress, setCandidateCardProgress] = useState<number[]>([0, 0, 0, 0]);
  const [enableTransforms, setEnableTransforms] = useState(true);
  const isInitialMount = useRef(true);
  const isMobile = useIsMobile();
  
  // Video refs for performance optimization
  const clientVideoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);
  const candidateVideoRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null, null]);

  // Optimize video playback - only play when visible
  useEffect(() => {
    const allVideoRefs = [...clientVideoRefs.current, ...candidateVideoRefs.current].filter(Boolean) as HTMLVideoElement[];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            video.play().catch(() => {
              // Autoplay prevented, that's okay
            });
          } else {
            video.pause();
          }
        });
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '100px'
      }
    );

    allVideoRefs.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      allVideoRefs.forEach((video) => {
        if (video) observer.unobserve(video);
      });
      observer.disconnect();
    };
  }, [checked]);

  // Listen for hash changes (when navigating via menu)
  useEffect(() => {
    const handleHashChange = () => {
      const newChecked = getCheckedFromHash();
      setChecked(prevChecked => {
        // Only update if actually different to prevent unnecessary re-renders
        if (newChecked !== prevChecked) {
          return newChecked;
        }
        return prevChecked;
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Also check on mount in case hash was set before component mounted
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mark initial mount as complete after first render cycle
  useEffect(() => {
    // Use a small timeout to ensure all initial effects have run
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enable transforms on all screen sizes for scroll animations
  useEffect(() => {
    // Keep transforms enabled on all devices for scroll animations
    setEnableTransforms(true);
  }, []);

  useEffect(() => {
    const showClient = !checked;
    const hidePanel = showClient ? candidatePanelRef.current : clientPanelRef.current;
    const showPanel = showClient ? clientPanelRef.current : candidatePanelRef.current;
    if (!hidePanel || !showPanel || !panelContainerRef.current) return;

    // On initial mount, set up panels without animation
    if (isInitialMount.current) {
      gsap.set(showPanel, { opacity: 1, x: 0, visibility: 'visible', position: 'absolute', inset: 0 });
      gsap.set(hidePanel, { opacity: 0, x: 60, visibility: 'visible', position: 'absolute', inset: 0 });
      const startHeight = showPanel.scrollHeight;
      gsap.set(panelContainerRef.current, { height: startHeight });
      
      // Update URL hash to match initial state
      const currentHash = window.location.hash;
      const expectedHash = checked ? '#candidate' : '#client';
      if (currentHash !== expectedHash) {
        window.history.replaceState(null, '', expectedHash);
      }
      return;
    }

    // Prepare visibility for incoming panel
    gsap.set(showPanel, { visibility: 'visible', position: 'absolute', inset: 0 });
    gsap.set(hidePanel, { visibility: 'visible', position: 'absolute', inset: 0 });

    // Measure target height of the incoming panel
    const targetHeight = (showPanel as HTMLDivElement).scrollHeight;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(hidePanel, { opacity: 0, x: -60, duration: 0.4 }, 0)
      .fromTo(showPanel, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5 }, 0.05)
      .to(panelContainerRef.current, { height: targetHeight, duration: 0.5 }, 0)
      .add(() => ScrollTrigger.refresh());

    // Update URL hash without reload (only if user clicked switch, not navigating via hash)
    const currentHash = window.location.hash;
    const expectedHash = checked ? '#candidate' : '#client';
    if (currentHash !== expectedHash) {
      window.history.pushState(null, '', expectedHash);
    }
  }, [checked]);

  // Update background color when checked state changes - simple CSS transition
  useEffect(() => {
    if (!pageRef.current) return;
    pageRef.current.style.transition = 'background-color 0.5s ease';
    pageRef.current.style.backgroundColor = checked ? 'var(--color-blue)' : 'var(--color-peach)';
  }, [checked]);

  // Transform helper for client cards (stable, progress-based)
  function getCardTransform(direction: 'left' | 'right', progress: number) {
    const dir = direction === 'left' ? -1 : 1;
    // Reduce transform intensity on mobile for better performance
    const isMobileDevice = window.innerWidth < 768;
    const dx = dir * progress * (isMobileDevice ? 60 : 120); // vw - reduced on mobile
    const dy = -80 * progress; // px
    const rot = dir * (isMobileDevice ? 10 : 20) * progress; // deg - reduced on mobile
    const scale = 1 - (isMobileDevice ? 0.2 : 0.4) * progress; // Less scale reduction on mobile
    return `translateX(${dx}vw) translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;
  }

  // Scroll handler for client cards fly-away effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight || 1;
          const isScrollingUp = scrollY < lastScrollYRef.current;
          const viewportCenter = windowHeight / 2;
          const targetProgress: number[] = [0, 0, 0, 0];

          clientCardRefs.current.forEach((cardRef, index) => {
            if (!cardRef) return;
            const rect = cardRef.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            // Positive when card center is above viewport center
            let distance = viewportCenter - cardCenter;
            // Add threshold so cards don't start moving until scrolled further past center
            // This gives users more time to read before animation begins
            const startThreshold = windowHeight * 0.25; // Cards won't move until 25% viewport height past center
            distance -= startThreshold;
            
            // Return earlier when scrolling up (bias by ~25% viewport height)
            const returnBiasPx = windowHeight * 0.25;
            if (isScrollingUp) {
              distance -= returnBiasPx;
            }
            // Map distance to 0..1; increased denominator for slower progress (cards stay longer)
            // Require more scroll distance before cards fly away
            const mappingDenom = windowHeight * (isScrollingUp ? 1.0 : 1.5);
            const raw = distance / mappingDenom;
            const clamped = Math.min(Math.max(raw, 0), 1);
            // Ease out for nicer start and end motion
            const eased = clamped * (2 - clamped);
            targetProgress[index] = eased;
          });

          // Smoothly approach target progress; much snappier when scrolling up
          const approach = isScrollingUp ? 0.65 : 0.35;
          setClientCardProgress(prev => prev.map((p, i) => p + (targetProgress[i] - p) * approach));

          // Update last scroll position
          lastScrollYRef.current = scrollY;

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll handler for candidate cards fly-away effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight || 1;
          const isScrollingUp = scrollY < lastCandidateScrollYRef.current;
          const viewportCenter = windowHeight / 2;
          const targetProgress: number[] = [0, 0, 0, 0];

          candidateCardRefs.current.forEach((cardRef, index) => {
            if (!cardRef) return;
            const rect = cardRef.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            // Positive when card center is above viewport center
            let distance = viewportCenter - cardCenter;
            // Add threshold so cards don't start moving until scrolled further past center
            // This gives users more time to read before animation begins
            const startThreshold = windowHeight * 0.25; // Cards won't move until 25% viewport height past center
            distance -= startThreshold;
            
            // Return earlier when scrolling up (bias by ~25% viewport height)
            const returnBiasPx = windowHeight * 0.25;
            if (isScrollingUp) {
              distance -= returnBiasPx;
            }
            // Map distance to 0..1; increased denominator for slower progress (cards stay longer)
            // Require more scroll distance before cards fly away
            const mappingDenom = windowHeight * (isScrollingUp ? 1.0 : 1.5);
            const raw = distance / mappingDenom;
            const clamped = Math.min(Math.max(raw, 0), 1);
            // Ease out for nicer start and end motion
            const eased = clamped * (2 - clamped);
            targetProgress[index] = eased;
          });

          // Smoothly approach target progress; much snappier when scrolling up
          const approach = isScrollingUp ? 0.65 : 0.35;
          setCandidateCardProgress(prev => prev.map((p, i) => p + (targetProgress[i] - p) * approach));

          // Update last scroll position
          lastCandidateScrollYRef.current = scrollY;

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Client panel scroll animations
  useGSAP(() => {
    const head = clientPanelRef.current?.querySelector('.client-head');
    const bullets = clientPanelRef.current?.querySelectorAll('.client-bullets li');
    const positions = clientPanelRef.current?.querySelectorAll('.client-positions li');
    const solutions = clientPanelRef.current?.querySelectorAll('.client-solutions li');
    const tags = clientPanelRef.current?.querySelectorAll('.client-tags span');
    const video = clientPanelRef.current?.querySelector('.client-video');

    if (head) {
      gsap.from(head, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: head as Element,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (bullets && bullets.length) {
      gsap.from(bullets, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: head as Element,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (positions && positions.length) {
      gsap.from(positions, {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: clientPanelRef.current as Element,
          start: 'top 60%',
          once: true
        }
      });
    }

    if (solutions && solutions.length) {
      gsap.from(solutions, {
        x: -20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: clientPanelRef.current as Element,
          start: 'top 55%',
          once: true
        }
      });
    }

    if (tags && tags.length) {
      gsap.from(tags, {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.05,
        scrollTrigger: {
          trigger: clientPanelRef.current as Element,
          start: 'top 50%',
          once: true
        }
      });
    }

    if (video) {
      gsap.from(video, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: video as Element,
          start: 'top 80%',
          once: true
        }
      });
    }
  }, { dependencies: [], scope: clientPanelRef });

  // Candidate panel scroll animations
  useGSAP(() => {
    const head = candidatePanelRef.current?.querySelector('.candidate-head');
    const bullets = candidatePanelRef.current?.querySelectorAll('.candidate-bullets li');
    const video = candidatePanelRef.current?.querySelector('.candidate-video');
    const cta = candidatePanelRef.current?.querySelector('.candidate-cta');

    if (head) {
      gsap.from(head, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: head as Element,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (bullets && bullets.length) {
      gsap.from(bullets, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: head as Element,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (video) {
      gsap.from(video, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: video as Element,
          start: 'top 80%',
          once: true
        }
      });
    }

    if (cta) {
      gsap.from(cta, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cta as Element,
          start: 'top 85%',
          once: true
        }
      });
    }
  }, { dependencies: [], scope: candidatePanelRef });

  return (
    <>
    <div ref={pageRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: checked ? 'var(--color-blue)' : 'var(--color-peach)', paddingTop: 'clamp(120px, 12vw, 192px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}>
      <div className="mx-auto relative" style={{ zIndex: 2, maxWidth: '1400px' }}>
        <div className="flex flex-col items-center justify-center" style={{ marginTop: 'clamp(40px, 4vw, 64px)', marginBottom: 'clamp(80px, 8vw, 128px)' }}>
          <div className="relative">
            <AnimatedSwitch
              checked={checked}
              onCheckedChange={(next) => setChecked(next)}
              leftLabel={<>Solve My<br />Hiring<br />Headaches</>}
              rightLabel={<>Find My<br />Dream Role</>}
              leftActive={true}
              borderColor={checked ? 'var(--color-white)' : 'var(--color-blue)'}
              switchBgColor={checked ? '#464C53' : 'var(--color-blue)'}
              sliderColor={checked ? 'var(--color-blue)' : 'var(--color-peach)'}
            />
            {!isMobile && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ marginTop: 'clamp(2px, 0.25vw, 4px)', gap: 'clamp(4px, 0.5vw, 8px)' }}>
                <Hand
                  className="animate-bounce"
                  style={{ 
                    transform: 'rotate(90deg)', 
                    animationDuration: '1.8s',
                    color: checked ? 'var(--color-white)' : 'var(--color-blue)',
                    width: 'clamp(28px, 2.5vw, 40px)',
                    height: 'clamp(28px, 2.5vw, 40px)'
                  }}
                />
                <span 
                  className="font-bold uppercase tracking-wider animate-pulse" 
                  style={{ 
                    fontFamily: 'TexGyreAdventor',
                    color: checked ? 'var(--color-white)' : 'var(--color-blue)',
                    fontSize: 'clamp(10px, 0.875vw, 14px)'
                  }}
                >
                  Click Me
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="mx-auto relative" style={{ zIndex: 10, marginBottom: 'clamp(120px, 12vw, 192px)', maxWidth: '1120px' }}>
          <VideoPlayer
            src={checked ? "/vids/CLIENTS.webm" : "/vids/COMPANIES.webm"}
            title="Work With Us Introduction"
            className="w-full"
          />
        </div>

        {/* Animated Panels */}
        <div ref={panelContainerRef} className="relative w-full pb-28">
          {/* Client Panel */}
          <div ref={clientPanelRef} className="overflow-visible">
            <div className="space-y-0">
              {/* Card 01 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[0] = el; }}
                className="client-card-01 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#ff9752',
                  transform: enableTransforms ? getCardTransform('left', clientCardProgress[0] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row h-full" style={{ gap: 'clamp(48px, 4vw, 200px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col md:flex-col lg:flex-col items-center md:items-start justify-center md:justify-start text-center md:text-left" style={{ paddingRight: 'clamp(0px, 0vw, 200px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Deep Industry Expertise
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        We live and breathe the Life Sciences sector — especially CDMO, CRO, and Diagnostics. Our market knowledge, network, and insights mean faster, smarter hires with less risk.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ left: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>01</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ right: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { clientVideoRefs.current[0] = el; }}
                        src="/vids/SHORT 1.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white" style={{ left: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    We live and breathe the Life Sciences sector — especially CDMO, CRO, and Diagnostics. Our market knowledge, network, and insights mean faster, smarter hires with less risk.
                  </p>
                )}
              </div>
              </div>

              {/* Card 02 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[1] = el; }}
                className="client-card-02 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#ff3632',
                  transform: enableTransforms ? getCardTransform('right', clientCardProgress[1] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row-reverse h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-end justify-center md:justify-start text-center md:text-right" style={{ paddingRight: 'clamp(0px, 0vw, 80px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Global Network, Personal Approach
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        With a 12,000+ LinkedIn network and long-standing industry relationships, we connect you to top talent worldwide — while providing a boutique, relationship-driven service.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ right: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>02</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ left: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { clientVideoRefs.current[1] = el; }}
                        src="/vids/SHORT 2.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white text-right" style={{ right: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    With a 20,000+ LinkedIn network and long-standing industry relationships, we connect you to top talent worldwide — while providing a boutique, relationship-driven service.
                  </p>
                )}
              </div>
              </div>

              {/* Card 03 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[2] = el; }}
                className="client-card-03 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#fdcc69',
                  transform: enableTransforms ? getCardTransform('left', clientCardProgress[2] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-start justify-center md:justify-start text-center md:text-left" style={{ paddingRight: 'clamp(0px, 0vw, 160px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Precision Recruitment
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        We don't just send CVs — we deliver the right people. Every search is built on deep understanding of your business goals, culture, and technical needs.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ left: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>03</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ right: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { clientVideoRefs.current[2] = el; }}
                        src="/vids/SHORT 3.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white" style={{ left: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    We don't just send CVs — we deliver the right people. Every search is built on deep understanding of your business goals, culture, and technical needs.
                  </p>
                )}
                </div>
              </div>

              {/* Card 04 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[3] = el; }}
                className="client-card-04 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#aa95de',
                  transform: enableTransforms ? getCardTransform('right', clientCardProgress[3] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row-reverse h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-end justify-center md:justify-start text-center md:text-right" style={{ paddingRight: 'clamp(0px, 0vw, 80px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Speed, Transparency & Trust
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        We move fast without cutting corners. You'll always know where your search stands, with honest communication and consistent delivery you can rely on.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ right: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>04</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ left: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { clientVideoRefs.current[3] = el; }}
                        src="/vids/SHORT 4.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white text-right" style={{ right: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    We move fast without cutting corners. You'll always know where your search stands, with honest communication and consistent delivery you can rely on.
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Candidate Panel */}
          <div ref={candidatePanelRef} className="overflow-visible">
            <div className="space-y-0">
              {/* Card 01 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[0] = el; }}
                className="candidate-card-01 md:sticky top-0 z-30 bg-brand-orange relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ borderRadius: 'clamp(36px, 3vw, 50px)', padding: 'clamp(32px, 3vw, 100px)', height: 'clamp(520px, 40vw, 720px)', width: 'clamp(94%, 90%, 1400px)', maxWidth: 'clamp(1152px, 90vw, 1400px)', transform: enableTransforms ? getCardTransform('left', candidateCardProgress[0] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row h-full" style={{ gap: 'clamp(48px, 4vw, 200px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-start justify-center md:justify-start text-center md:text-left" style={{ paddingRight: 'clamp(0px, 0vw, 200px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Industry Insiders, Not Generalists
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        We specialise exclusively in Life Sciences — from CDMOs and CROs to Diagnostics. You'll work with recruiters who truly understand your world, your skill set, and where you can go next.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ left: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>01</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ right: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { candidateVideoRefs.current[0] = el; }}
                        src="/vids/SHORT 1.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white" style={{ left: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    We specialise exclusively in Life Sciences — from CDMOs and CROs to Diagnostics. You'll work with recruiters who truly understand your world, your skill set, and where you can go next.
                  </p>
                )}
              </div>
              </div>

              {/* Card 02 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[1] = el; }}
                className="candidate-card-02 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#ff3632',
                  transform: enableTransforms ? getCardTransform('right', candidateCardProgress[1] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row-reverse h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[65%] z-10 h-full flex flex-col items-center md:items-end justify-center md:justify-start text-center md:text-right" style={{ paddingRight: 'clamp(0px, 0vw, 48px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Real Opportunities, Not Random Roles
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        We only present positions that align with your goals, values, and expertise — no spam, no pressure. Every conversation is about fit, not just filling jobs.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ right: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>02</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ left: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { candidateVideoRefs.current[1] = el; }}
                        src="/vids/SHORT 2.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white text-right" style={{ right: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    We only present positions that align with your goals, values, and expertise — no spam, no pressure. Every conversation is about fit, not just filling jobs.
                  </p>
                )}
              </div>
              </div>

              {/* Card 03 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[2] = el; }}
                className="candidate-card-03 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#fdcc69',
                  transform: enableTransforms ? getCardTransform('left', candidateCardProgress[2] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-start justify-center md:justify-start text-center md:text-left" style={{ paddingRight: 'clamp(0px, 0vw, 160px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Guidance That Adds Value
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        From CV advice to interview prep and market insight, we'll help you navigate your next move with clarity and confidence.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ left: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>03</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ right: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { candidateVideoRefs.current[2] = el; }}
                        src="/vids/SHORT 3.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white" style={{ left: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    From CV advice to interview prep and market insight, we'll help you navigate your next move with clarity and confidence.
                  </p>
                )}
                </div>
              </div>

              {/* Card 04 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[3] = el; }}
                className="candidate-card-04 md:sticky top-0 z-30 relative overflow-hidden mx-auto transition-all duration-500 ease-out"
                style={{ 
                  borderRadius: 'clamp(36px, 3vw, 50px)', 
                  padding: 'clamp(32px, 3vw, 100px)', 
                  height: 'clamp(520px, 40vw, 720px)', 
                  width: 'clamp(94%, 90%, 1400px)', 
                  maxWidth: 'clamp(1152px, 90vw, 1400px)',
                  backgroundColor: '#aa95de',
                  transform: enableTransforms ? getCardTransform('right', candidateCardProgress[3] || 0) : undefined 
                }}
              >
                <div className="flex flex-col lg:flex-row-reverse h-full" style={{ gap: 'clamp(48px, 4vw, 160px)' }}>
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-center md:items-end justify-center md:justify-start text-center md:text-right" style={{ paddingRight: 'clamp(0px, 0vw, 80px)' }}>
                    <h2 className="font-bold leading-[0.95] text-white" style={{ fontSize: 'clamp(40px, 4vw, 72px)', marginBottom: 'clamp(24px, 2vw, 80px)' }}>
                      Confidentiality & Honesty Always
                    </h2>
                    {isMobile && (
                      <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '90%' }}>
                        Your trust matters. We keep every conversation discreet and communicate openly — so you always know where you stand.
                      </p>
                    )}
                  </div>

                  <div className="hidden md:block lg:absolute lg:-top-8" style={{ right: 'clamp(32px, 2.5vw, 32px)' }}>
                    <span className="font-bold leading-none text-white/20" style={{ fontSize: 'clamp(160px, 16vw, 320px)' }}>04</span>
                  </div>

                  <div className="hidden md:block lg:absolute lg:top-1/2 lg:-translate-y-1/2" style={{ left: 'clamp(80px, 5vw, 80px)' }}>
                    <div className="w-full aspect-[9/16] overflow-hidden" style={{ maxWidth: 'clamp(220px, 18vw, 360px)', borderRadius: 'clamp(20px, 1.5vw, 24px)' }}>
                      <video
                        ref={(el) => { candidateVideoRefs.current[3] = el; }}
                        src="/vids/SHORT 5.webm"
                        loop
                        muted
                        playsInline
                        preload="none"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                        }}
                      />
                    </div>
                  </div>
                </div>
                {!isMobile && (
                  <p className="absolute text-white text-right" style={{ right: 'clamp(32px, 2.5vw, 80px)', bottom: 'clamp(60px, 5vw, 100px)', fontSize: 'clamp(18px, 1.5vw, 28px)', maxWidth: 'clamp(672px, 50vw, 800px)' }}>
                    Your trust matters. We keep every conversation discreet and communicate openly — so you always know where you stand.
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Extra spacing before footer removed to tighten space under 4th card */}
      </div>
    </div>
    <Footer />
    </>
  );
}


