import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import ReviewMarquee, { type Review } from "@/components/ReviewMarquee";
import { gsap, useGSAP } from "@/lib/gsap";
import LifeSciencesIcons from "@/components/LifeSciencesIcons";

export default function ProofInThePeople() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const caseStudiesRef = useRef<HTMLDivElement>(null);
  const caseStudyCardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [caseStudyCardProgress, setCaseStudyCardProgress] = useState<number[]>([0, 0, 0]);
  const lastScrollYRef = useRef(0);
  const [enableTransforms, setEnableTransforms] = useState(true);

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

  // Disable heavy transforms on small screens for stability
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setEnableTransforms(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Transform helper for case study cards (same as Work With Us)
  function getCardTransform(direction: 'left' | 'right', progress: number) {
    const dir = direction === 'left' ? -1 : 1;
    const dx = dir * progress * 120; // vw
    const dy = -80 * progress; // px
    const rot = dir * 20 * progress; // deg
    const scale = 1 - 0.4 * progress;
    return `translateX(${dx}vw) translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;
  }

  // Scroll handler for case study cards fly-away effect (same as Work With Us)
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
          setCaseStudyCardProgress(prev => prev.map((p, i) => p + (targetProgress[i] - p) * approach));

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

  return (
    <>
      <div className="min-h-screen pt-48 px-6 relative" style={{ backgroundColor: '#FF914D' }}>
        {/* Life Sciences Icons */}
        <LifeSciencesIcons count={12} side="both" size={70} />
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
          <h1 className="text-8xl font-bold mb-16 text-center">
            Proof in the People
          </h1>

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
            <div className="relative -mx-6 pt-8 pb-16">
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

          {/* Case Studies */}
          <section className="mt-32 pb-32" ref={caseStudiesRef}>
            <h2 className="text-8xl font-bold mb-32 text-center">
              Case Studies
            </h2>
            <div className="space-y-32">
              {/* Card 1 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[0] = el; }}
                    className="case-study-card md:sticky top-0 z-30 max-w-7xl mx-auto bg-[#00BFFF] border border-[#33D4FF] rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-lg transition-all duration-500 ease-out"
                    style={{ transform: enableTransforms ? getCardTransform('left', caseStudyCardProgress[0] || 0) : undefined }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      {/* Text Column */}
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-white/80">Partnering with investors</span>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-white leading-[1.05]">
                          Scaling Value: How We Helped an Investor Build a Leadership Team That Delivered Growth
                        </h3>
                        <p className="mt-6 text-white/90 leading-relaxed text-lg">
                          When a life sciences investor acquired a small CDMO, they needed to quickly install a capable, experienced leadership
                          team to drive growth. CDC partnered directly with the investors to identify key hires across C-suite and functional
                          leadership.
                        </p>
                        <p className="mt-8 text-white/85 text-base leading-relaxed">
                          We identified, engaged, and closed senior hires across commercial, operations, and technical leadership, enabling the investor to deliver on its growth plan ahead of schedule.
                        </p>
                      </div>
                      {/* Image Column */}
                      <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-gray-100">
                          <img 
                            src="/place holders faces/people-beauty-positive-emotions-concept-attractive-smiling-young-woman-with-bobbed-hairdo-dressed-green-casual-sweater-glad-recieve-present.jpg"
                            alt="Case study headshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Card 2 - Mirrored */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[1] = el; }}
                    className="case-study-card md:sticky top-0 z-30 max-w-7xl mx-auto bg-[#00BFFF] border border-[#33D4FF] rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-lg transition-all duration-500 ease-out"
                    style={{ transform: enableTransforms ? getCardTransform('right', caseStudyCardProgress[1] || 0) : undefined }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      {/* Image Column - Left for mirrored */}
                      <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-gray-100">
                          <img 
                            src="/place holders faces/cheerful-smiling-bearded-man-laughing.jpg"
                            alt="Case study headshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* Text Column - Right for mirrored */}
                      <div className="flex flex-col order-1 lg:order-2">
                        <span className="text-xs uppercase tracking-wider text-white/80">Supporting global commercial expansion</span>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-white leading-[1.05]">
                          From APAC to Global: Building a Commercial Team That Crossed Borders
                        </h3>
                        <p className="mt-6 text-white/90 leading-relaxed text-lg">
                          A leading Indian CDMO worked with CDC to grow its global presence with multiple commercial individuals. We leveraged
                          our deep network across Europe and the US to source experienced sales, marketing, and commercial talent who could launch
                          and scale the brand internationally.
                        </p>
                        <p className="mt-8 text-white/85 text-base leading-relaxed">
                          The programme delivered a continent-spanning commercial function, dramatically reducing the time-to-hire and seeding new revenue streams in the US and Europe.
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative h-[70vh] sm:h-[75vh] md:h-[85vh]">
                <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                  <article 
                    ref={(el) => { caseStudyCardRefs.current[2] = el; }}
                    className="case-study-card md:sticky top-0 z-30 max-w-7xl mx-auto bg-[#00BFFF] border border-[#33D4FF] rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-lg transition-all duration-500 ease-out"
                    style={{ transform: enableTransforms ? getCardTransform('left', caseStudyCardProgress[2] || 0) : undefined }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                      {/* Text Column */}
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-white/80">Full site build out</span>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-white leading-[1.05]">
                          Building from the Ground Up: Staffing a New Site from C-Suite to Scientists
                        </h3>
                        <p className="mt-6 text-white/90 leading-relaxed text-lg">
                          A startup precision medicine company in San Francisco needed support from leadership to clinical scientists. With a tight
                          launch timeline, CDC embedded alongside the company's leadership team to manage all hiring, from employer branding to offer
                          management.
                        </p>
                        <p className="mt-8 text-white/85 text-base leading-relaxed">
                          We built a full end-to-end hiring engine, filling 45 positions in under five months and standing up the site ahead of its launch date.
                        </p>
                      </div>
                      {/* Image Column */}
                      <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden bg-gray-100">
                          <img 
                            src="/place holders faces/front-view-woman-testing-colours.jpg"
                            alt="Case study headshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

