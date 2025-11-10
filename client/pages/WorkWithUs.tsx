import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import VideoPlayer from "@/components/VideoPlayer";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import AmbientOrbs from "@/components/AmbientOrbs";
import LifeSciencesIcons from "@/components/LifeSciencesIcons";
import { Hand } from "lucide-react";

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

  // Disable heavy transforms on small screens for stability
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setEnableTransforms(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
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

  // Update background color when checked state changes
  useEffect(() => {
    if (!pageRef.current) return;
    
    // On initial mount, set immediately without animation
    const isInitial = isInitialMount.current;
    if (isInitial) {
      pageRef.current.style.backgroundColor = checked ? '#00BFFF' : '#FF914D';
    } else {
      // On subsequent changes, animate the color transition
      gsap.to(pageRef.current, {
        backgroundColor: checked ? '#00BFFF' : '#FF914D',
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [checked]);

  // Transform helper for client cards (stable, progress-based)
  function getCardTransform(direction: 'left' | 'right', progress: number) {
    const dir = direction === 'left' ? -1 : 1;
    const dx = dir * progress * 120; // vw
    const dy = -80 * progress; // px
    const rot = dir * 20 * progress; // deg
    const scale = 1 - 0.4 * progress;
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
            // Return earlier when scrolling up (bias by ~25% viewport height)
            const returnBiasPx = windowHeight * 0.25;
            if (isScrollingUp) {
              distance -= returnBiasPx;
            }
            // Map distance to 0..1; slightly tighter when scrolling up so it returns earlier
            const mappingDenom = windowHeight * (isScrollingUp ? 0.45 : 0.5);
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
            // Return earlier when scrolling up (bias by ~25% viewport height)
            const returnBiasPx = windowHeight * 0.25;
            if (isScrollingUp) {
              distance -= returnBiasPx;
            }
            // Map distance to 0..1; slightly tighter when scrolling up so it returns earlier
            const mappingDenom = windowHeight * (isScrollingUp ? 0.45 : 0.5);
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
    <div ref={pageRef} className="relative min-h-screen pt-48 px-8 overflow-hidden" style={{ backgroundColor: checked ? '#00BFFF' : '#FF914D' }}>
      {/* Life Sciences Icons - only show on orange background */}
      {!checked && <LifeSciencesIcons count={12} side="both" size={70} />}
      {/* Grain effect overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.22]"
        style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          mixBlendMode: 'multiply'
        }}
      />
      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
        <AmbientOrbs tone={checked ? 'red' : 'peach'} />
        
        <div className="mt-16 mb-32 flex flex-col items-center justify-center">
          <div className="relative">
            <AnimatedSwitch
              checked={checked}
              onCheckedChange={(next) => setChecked(next)}
              leftLabel={<>Solve my<br />hiring<br />headaches</>}
              rightLabel={<>Find my<br />dream role</>}
              leftActive={true}
            />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white pointer-events-none">
              <Hand
                className="w-8 h-8 md:w-10 md:h-10 animate-bounce"
                style={{ transform: 'rotate(90deg)', animationDuration: '1.8s' }}
              />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider animate-pulse" style={{ fontFamily: 'TexGyreAdventor' }}>
                Click Me
              </span>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-48 max-w-5xl mx-auto relative" style={{ zIndex: 10 }}>
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/20 blur-xl" />
          <div className="absolute -bottom-6 -left-8 w-28 h-28 rounded-full bg-white/10 blur-2xl" />
          <VideoPlayer
            src="/CDC Website - ROUGH CUT 1.mp4"
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
                className="client-card-01 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-red p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('left', clientCardProgress[0] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col pr-0 lg:pr-40">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Deep Industry Expertise
                    </h2>
                  </div>

                  <div className="lg:absolute lg:left-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">01</span>
                  </div>

                  <div className="lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute left-8 md:left-12 lg:left-16 xl:left-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl">
                    We live and breathe the Life Sciences sector — especially CDMO, CRO, and Diagnostics. Our market knowledge, network, and insights mean faster, smarter hires with less risk.
                </p>
              </div>
              </div>

              {/* Card 02 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[1] = el; }}
                className="client-card-02 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-red p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('right', clientCardProgress[1] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row-reverse gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-end text-right pr-0 lg:pr-12">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Global Network, Personal Approach
                    </h2>
                  </div>

                  <div className="lg:absolute lg:right-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">02</span>
                  </div>

                  <div className="lg:absolute lg:left-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute right-8 md:right-12 lg:right-16 xl:right-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl text-right">
                    With a 20,000+ LinkedIn network and long-standing industry relationships, we connect you to top talent worldwide — while providing a boutique, relationship-driven service.
                </p>
              </div>
              </div>

              {/* Card 03 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[2] = el; }}
                className="client-card-03 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-red p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('left', clientCardProgress[2] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col pr-0 lg:pr-40">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Precision Recruitment
                    </h2>
                  </div>

                  <div className="lg:absolute lg:left-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">03</span>
                  </div>

                  <div className="lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute left-8 md:left-12 lg:left-16 xl:left-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl">
                  We don't just send CVs — we deliver the right people. Every search is built on deep understanding of your business goals, culture, and technical needs.
                </p>
                </div>
              </div>

              {/* Card 04 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { clientCardRefs.current[3] = el; }}
                className="client-card-04 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-red p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('right', clientCardProgress[3] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row-reverse gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-end text-right pr-0 lg:pr-12">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Speed, Transparency & Trust
                    </h2>
                  </div>

                  <div className="lg:absolute lg:right-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">04</span>
                  </div>

                  <div className="lg:absolute lg:left-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                  src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute right-8 md:right-12 lg:right-16 xl:right-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl text-right">
                  We move fast without cutting corners. You'll always know where your search stands, with honest communication and consistent delivery you can rely on.
                </p>
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
                className="candidate-card-01 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-orange p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('left', candidateCardProgress[0] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col pr-0 lg:pr-40">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Industry Insiders, Not Generalists
                    </h2>
                  </div>

                  <div className="lg:absolute lg:left-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">01</span>
                  </div>

                  <div className="lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute left-8 md:left-12 lg:left-16 xl:left-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl">
                  We specialise exclusively in Life Sciences — from CDMOs and CROs to Diagnostics. You'll work with recruiters who truly understand your world, your skill set, and where you can go next.
                </p>
              </div>
              </div>

              {/* Card 02 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[1] = el; }}
                className="candidate-card-02 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-orange p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('right', candidateCardProgress[1] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row-reverse gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-end text-right pr-0 lg:pr-12">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Real Opportunities, Not Random Roles
                    </h2>
                  </div>

                  <div className="lg:absolute lg:right-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">02</span>
                  </div>

                  <div className="lg:absolute lg:left-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute right-8 md:right-12 lg:right-16 xl:right-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl text-right">
                    We only present positions that align with your goals, values, and expertise — no spam, no pressure. Every conversation is about fit, not just filling jobs.
                </p>
              </div>
              </div>

              {/* Card 03 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[2] = el; }}
                className="candidate-card-03 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-orange p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('left', candidateCardProgress[2] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col pr-0 lg:pr-40">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Guidance That Adds Value
                    </h2>
                  </div>

                  <div className="lg:absolute lg:left-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">03</span>
                  </div>

                  <div className="lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                        src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute left-8 md:left-12 lg:left-16 xl:left-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl">
                  From CV advice to interview prep and market insight, we'll help you navigate your next move with clarity and confidence.
                </p>
                </div>
              </div>

              {/* Card 04 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
              <div 
                ref={(el) => { candidateCardRefs.current[3] = el; }}
                className="candidate-card-04 md:sticky top-0 z-30 rounded-[36px] md:rounded-[44px] lg:rounded-[50px] bg-brand-orange p-8 md:p-12 lg:p-16 xl:p-20 relative overflow-hidden h-[520px] sm:h-[560px] md:h-[600px] lg:h-[640px] w-[94%] md:w-[90%] max-w-6xl mx-auto transition-all duration-500 ease-out"
                style={{ transform: enableTransforms ? getCardTransform('right', candidateCardProgress[3] || 0) : undefined }}
              >
                <div className="flex flex-col lg:flex-row-reverse gap-12 md:gap-20 lg:gap-28 xl:gap-40 h-full">
                  <div className="flex-1 w-full md:max-w-[55%] z-10 h-full flex flex-col items-end text-right pr-0 lg:pr-12">
                    <h2 className="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] xl:text-[72px] font-bold leading-[0.95] text-white mb-8 md:mb-16 lg:mb-20">
                      Confidentiality & Honesty Always
                    </h2>
                  </div>

                  <div className="lg:absolute lg:right-8 lg:-top-8">
                    <span className="text-[160px] md:text-[220px] lg:text-[280px] xl:text-[320px] font-bold leading-none text-white/20">04</span>
                  </div>

                  <div className="lg:absolute lg:left-20 lg:top-1/2 lg:-translate-y-1/2">
                    <div className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] lg:max-w-[250px] xl:max-w-[280px] aspect-[9/16] rounded-[20px] md:rounded-[22px] lg:rounded-[24px] overflow-hidden">
                      <video
                  src="/CDC Website - ROUGH CUT 1.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="absolute right-8 md:right-12 lg:right-16 xl:right-20 bottom-10 md:bottom-14 lg:bottom-16 text-lg md:text-xl lg:text-2xl text-white max-w-2xl text-right">
                  Your trust matters. We keep every conversation discreet and communicate openly — so you always know where you stand.
                </p>
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


