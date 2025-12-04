import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import ReviewMarquee, { type Review } from "@/components/ReviewMarquee";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { Hand } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProofInThePeople() {
  // Helper function to get checked state from hash
  const getCheckedFromHash = () => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#case-studies';
  };
  
  const [checked, setChecked] = useState(() => getCheckedFromHash());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const testimonialsPanelRef = useRef<HTMLDivElement>(null);
  const caseStudiesPanelRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const caseStudyCardRefs = useRef<(HTMLElement | null)[]>([null, null, null]);
  const [caseStudyCardProgress, setCaseStudyCardProgress] = useState<number[]>([0, 0, 0]);
  const lastScrollYRef = useRef(0);
  const [enableTransforms, setEnableTransforms] = useState(true);
  const isInitialMount = useRef(true);
  const isMobile = useIsMobile();

  // Listen for hash changes (when navigating via menu)
  useEffect(() => {
    const handleHashChange = () => {
      const newChecked = getCheckedFromHash();
      setChecked(prevChecked => {
        if (newChecked !== prevChecked) {
          return newChecked;
        }
        return prevChecked;
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Mark initial mount as complete after first render cycle
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch("/reviews.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setReviews(
            data.map((r) => ({
              id: r.id,
              authorName: r.authorName,
              authorTitle: r.authorTitle,
              company: r.company,
              avatarUrl: r.avatarUrl,
              quote: r.quote,
              sourceUrl: r.sourceUrl,
            })) as Review[],
          );
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Unable to load reviews");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasReviews = useMemo(() => reviews.length > 0, [reviews]);

  // Enable transforms on all screen sizes for scroll animations
  useEffect(() => {
    // Keep transforms enabled on all devices for scroll animations
    setEnableTransforms(true);
  }, []);

  useEffect(() => {
    const showTestimonials = !checked;
    const hidePanel = showTestimonials ? caseStudiesPanelRef.current : testimonialsPanelRef.current;
    const showPanel = showTestimonials ? testimonialsPanelRef.current : caseStudiesPanelRef.current;
    if (!hidePanel || !showPanel || !panelContainerRef.current) return;

    // On initial mount, set up panels without animation
    if (isInitialMount.current) {
      gsap.set(showPanel, { opacity: 1, x: 0, visibility: 'visible', position: 'relative', display: 'block' });
      gsap.set(hidePanel, { opacity: 0, x: 60, visibility: 'hidden', position: 'absolute', display: 'none', top: 0, left: 0, width: '100%' });
      gsap.set(panelContainerRef.current, { height: 'auto' });
      
      // Update URL hash to match initial state
      const currentHash = window.location.hash;
      const expectedHash = checked ? '#case-studies' : '#testimonials';
      if (currentHash !== expectedHash) {
        window.history.replaceState(null, '', expectedHash);
      }
      return;
    }

    // Prepare panels for transition
    const currentHeight = panelContainerRef.current.scrollHeight;
    gsap.set(hidePanel, { position: 'absolute', top: 0, left: 0, width: '100%', visibility: 'visible' });
    
    // Measure target height - temporarily show the incoming panel
    gsap.set(showPanel, { position: 'absolute', top: 0, left: 0, width: '100%', visibility: 'visible', opacity: 0 });
    const targetHeight = (showPanel as HTMLDivElement).scrollHeight;
    
    // Set container to fixed height for smooth transition
    gsap.set(panelContainerRef.current, { height: currentHeight });

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(hidePanel, { opacity: 0, x: -60, duration: 0.4 }, 0)
      .to(panelContainerRef.current, { height: targetHeight, duration: 0.5 }, 0)
      .fromTo(showPanel, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5 }, 0.05)
      .set(hidePanel, { visibility: 'hidden', display: 'none', position: 'absolute' }, 0.5)
      .set(showPanel, { position: 'relative', display: 'block', visibility: 'visible' }, 0.5)
      .call(() => {
        // After animation, set container to auto height so it fits the active panel
        if (panelContainerRef.current) {
          panelContainerRef.current.style.height = 'auto';
        }
      }, [], 0.5)
      .add(() => ScrollTrigger.refresh());

    // Update URL hash without reload
    const currentHash = window.location.hash;
    const expectedHash = checked ? '#case-studies' : '#testimonials';
    if (currentHash !== expectedHash) {
      window.history.pushState(null, '', expectedHash);
    }
  }, [checked]);

  // Update background color when checked state changes
  useEffect(() => {
    if (!pageRef.current) return;
    pageRef.current.style.transition = 'background-color 0.5s ease';
    pageRef.current.style.backgroundColor = checked ? 'var(--color-blue)' : 'var(--color-peach)';
  }, [checked]);

  // Transform helper for case study cards
  function getCardTransform(direction: 'left' | 'right', progress: number) {
    if (progress < 0.001) {
      return 'none';
    }
    const dir = direction === 'left' ? -1 : 1;
    // Reduce transform intensity on mobile for better performance
    const isMobileDevice = window.innerWidth < 768;
    const dx = dir * progress * (isMobileDevice ? 60 : 120); // vw - reduced on mobile
    const dy = -80 * progress; // px
    const rot = dir * (isMobileDevice ? 10 : 20) * progress; // deg - reduced on mobile
    const scale = 1 - (isMobileDevice ? 0.2 : 0.4) * progress; // Less scale reduction on mobile
    return `translateX(${dx}vw) translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;
  }

  // Scroll handler for case study cards fly-away effect
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight || 1;
          const isScrollingUp = scrollY < lastScrollYRef.current;
          const viewportCenter = windowHeight / 2;
          const targetProgress: number[] = [0, 0, 0];

          caseStudyCardRefs.current.forEach((cardRef, index) => {
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

          const approach = isScrollingUp ? 0.65 : 0.35;
          setCaseStudyCardProgress(prev => prev.map((p, i) => p + (targetProgress[i] - p) * approach));

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

  return (
    <>
    <div ref={pageRef} className="relative min-h-screen overflow-hidden" style={{ backgroundColor: checked ? 'var(--color-blue)' : 'var(--color-peach)', paddingTop: 'clamp(120px, 12vw, 192px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}>
      <div className="mx-auto relative" style={{ zIndex: 2, maxWidth: '1400px' }}>
        <div className="flex flex-col items-center justify-center" style={{ marginTop: 'clamp(40px, 4vw, 64px)', marginBottom: 'clamp(80px, 8vw, 128px)' }}>
          <div className="relative">
            <AnimatedSwitch
              checked={checked}
              onCheckedChange={(next) => setChecked(next)}
              leftLabel={<>Read Our<br />Testimonials</>}
              rightLabel={<>Check Out Our<br />Case Studies</>}
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

        {/* Animated Panels */}
        <div ref={panelContainerRef} className="relative w-full" style={{ minHeight: 0, paddingBottom: isMobile ? (checked ? 'clamp(200px, 40vw, 300px)' : 'clamp(0px, 0vw, 16px)') : 'clamp(32px, 2vw, 32px)' }}>
          {/* Testimonials Panel */}
          <div ref={testimonialsPanelRef} className="overflow-visible w-full">
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 'clamp(0px, 0vw, 16px)' : 'clamp(64px, 4vw, 64px)' }}>
              {loading && (
                <div className="text-gray-900/80 bg-white border border-gray-200 rounded-2xl p-6">
                  Loading reviews…
                </div>
              )}

              {!loading && error && (
                <div className="text-gray-900/80 bg-white border border-gray-200 rounded-2xl p-6">
                  {error}
                </div>
              )}

              {!loading && !error && hasReviews && (
                <div className="relative -mx-6" style={{ paddingTop: 'clamp(16px, 2vw, 32px)', paddingBottom: isMobile ? '0' : 'clamp(32px, 2vw, 32px)' }}>
                  <ReviewMarquee reviews={reviews} speedSeconds={42} rows={1} />
                </div>
              )}

              {!loading && !error && !hasReviews && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <p className="text-gray-900/80">
                    No reviews are live yet. Once permissions are confirmed, add them to <code className="bg-gray-100 px-1.5 py-0.5 rounded">public/reviews.json</code> and include image URLs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Case Studies Panel */}
          <div ref={caseStudiesPanelRef} className="overflow-visible">
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 'clamp(300px, 60vw, 500px)' : 'clamp(80px, 8vw, 128px)', paddingBottom: isMobile ? 'clamp(200px, 40vw, 300px)' : '0' }}>
              {/* Card 1 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[0] = el; }}
                    className="case-study-card md:sticky top-0 z-30 mx-auto shadow-lg transition-all duration-500 ease-out"
                    style={{ 
                      backgroundColor: '#fdcc69',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: 'clamp(16px, 1.5vw, 24px)',
                      padding: 'clamp(32px, 3vw, 64px)',
                      maxWidth: '1120px',
                      transform: enableTransforms ? getCardTransform('left', caseStudyCardProgress[0] || 0) : undefined 
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(24px, 2vw, 48px)' }}>
                      {/* Text Column */}
                      <div className="flex flex-col">
                        <span className="uppercase tracking-wider text-white/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>Partnering with investors</span>
                        <h3 className="font-bold text-white leading-[1.05]" style={{ fontSize: 'clamp(28px, 3vw, 48px)', marginTop: 'clamp(8px, 0.75vw, 12px)' }}>
                          Scaling Value: How We Helped an Investor Build a Leadership Team That Delivered Growth
                        </h3>
                        <p className="text-white/90 leading-relaxed" style={{ marginTop: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
                          When a life sciences investor acquired a small CDMO, they needed to quickly install a capable, experienced leadership
                          team to drive growth. CDC partnered directly with the investors to identify key hires across C-suite and functional
                          leadership.
                        </p>
                        <p className="text-white/85 leading-relaxed" style={{ marginTop: 'clamp(24px, 2vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>
                          We identified, engaged, and closed senior hires across commercial, operations, and technical leadership, enabling the investor to deliver on its growth plan ahead of schedule.
                        </p>
                      </div>
                      {/* Image Column */}
                      <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100" style={{ maxWidth: 'clamp(300px, 25vw, 400px)', borderRadius: 'clamp(16px, 1.5vw, 24px)' }}>
                          <img 
                            src="/testimonials/medium-shot-smiley-doctor-wearing-goggles.jpg"
                            alt="Case study"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Card 2 - Mirrored */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]" style={{ marginTop: isMobile ? 'clamp(100px, 20vw, 150px)' : '0' }}>
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[1] = el; }}
                    className="case-study-card md:sticky top-0 z-30 mx-auto shadow-lg transition-all duration-500 ease-out"
                    style={{ 
                      backgroundColor: '#aa95de',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: 'clamp(16px, 1.5vw, 24px)',
                      padding: 'clamp(32px, 3vw, 64px)',
                      maxWidth: '1120px',
                      transform: enableTransforms ? getCardTransform('right', caseStudyCardProgress[1] || 0) : undefined 
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(24px, 2vw, 48px)' }}>
                      {/* Image Column - Left for mirrored */}
                      <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100" style={{ maxWidth: 'clamp(300px, 25vw, 400px)', borderRadius: 'clamp(16px, 1.5vw, 24px)' }}>
                          <img 
                            src="/testimonials/medium-shot-smiley-scientist.jpg"
                            alt="Case study"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* Text Column - Right for mirrored */}
                      <div className="flex flex-col order-1 lg:order-2">
                        <span className="uppercase tracking-wider text-white/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>Supporting global commercial expansion</span>
                        <h3 className="font-bold text-white leading-[1.05]" style={{ fontSize: 'clamp(28px, 3vw, 48px)', marginTop: 'clamp(8px, 0.75vw, 12px)' }}>
                          From APAC to Global: Building a Commercial Team That Crossed Borders
                        </h3>
                        <p className="text-white/90 leading-relaxed" style={{ marginTop: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
                          A leading Indian CDMO worked with CDC to grow its global presence with multiple commercial individuals. We leveraged
                          our deep network across Europe and the US to source experienced sales, marketing, and commercial talent who could launch
                          and scale the brand internationally.
                        </p>
                        <p className="text-white/85 leading-relaxed" style={{ marginTop: 'clamp(24px, 2vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>
                          The programme delivered a continent-spanning commercial function, dramatically reducing the time-to-hire and seeding new revenue streams in the US and Europe.
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]" style={{ marginTop: isMobile ? 'clamp(80px, 15vw, 120px)' : '0' }}>
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[2] = el; }}
                    className="case-study-card md:sticky top-0 z-30 mx-auto shadow-lg transition-all duration-500 ease-out"
                    style={{ 
                      backgroundColor: '#ff3632',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: 'clamp(16px, 1.5vw, 24px)',
                      padding: 'clamp(32px, 3vw, 64px)',
                      maxWidth: '1120px',
                      transform: enableTransforms ? getCardTransform('left', caseStudyCardProgress[2] || 0) : undefined 
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(24px, 2vw, 48px)' }}>
                      {/* Text Column */}
                      <div className="flex flex-col">
                        <span className="uppercase tracking-wider text-white/80" style={{ fontSize: 'clamp(10px, 0.75vw, 12px)' }}>Full site build out</span>
                        <h3 className="font-bold text-white leading-[1.05]" style={{ fontSize: 'clamp(28px, 3vw, 48px)', marginTop: 'clamp(8px, 0.75vw, 12px)' }}>
                          Building from the Ground Up: Staffing a New Site from C-Suite to Scientists
                        </h3>
                        <p className="text-white/90 leading-relaxed" style={{ marginTop: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
                          A startup precision medicine company in San Francisco needed support from leadership to clinical scientists. With a tight
                          launch timeline, CDC embedded alongside the company's leadership team to manage all hiring, from employer branding to offer
                          management.
                        </p>
                        <p className="text-white/85 leading-relaxed" style={{ marginTop: 'clamp(24px, 2vw, 32px)', fontSize: 'clamp(14px, 1vw, 16px)' }}>
                          We built a full end-to-end hiring engine, filling 45 positions in under five months and standing up the site ahead of its launch date.
                        </p>
                      </div>
                      {/* Image Column */}
                      <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-full aspect-square overflow-hidden bg-gray-100" style={{ maxWidth: 'clamp(300px, 25vw, 400px)', borderRadius: 'clamp(16px, 1.5vw, 24px)' }}>
                          <img 
                            src="/testimonials/pharmacist-work.jpg"
                            alt="Case study"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
