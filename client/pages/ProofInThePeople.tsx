import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import ReviewMarquee, { type Review } from "@/components/ReviewMarquee";
import { Check } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function ProofInThePeople() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const caseStudiesRef = useRef<HTMLDivElement>(null);

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

  // Scroll-based animations for case studies
  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>(".case-study-card");
    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 100, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.05,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, { scope: caseStudiesRef });

  return (
    <>
      <div className="min-h-screen pt-48 px-6" style={{ backgroundColor: '#FF914D' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-8xl font-bold mb-16 text-center" style={{ fontFamily: 'Milker' }}>
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
            <h2 className="text-8xl font-bold mb-32 text-center" style={{ fontFamily: 'Milker' }}>
              Case Studies
            </h2>
            <div className="space-y-32">
              {/* Card 1 */}
              <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                <article className="case-study-card max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-md transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg">
                <span className="text-xs uppercase tracking-wider text-gray-500">Partnering with investors</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-gray-900 leading-[1.05]" style={{ fontFamily: 'Milker' }}>
                  Scaling Value: How We Helped an Investor Build a Leadership Team That Delivered Growth
                </h3>
                <p className="mt-6 text-gray-800 leading-relaxed text-lg">
                  When a life sciences investor acquired a small CDMO, they needed to quickly install a capable, experienced leadership
                  team to drive growth. CDC partnered directly with the investors to identify key hires across C-suite and functional
                  leadership.
                </p>
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900">Key outcomes</h4>
                  <ul className="mt-4 space-y-3 text-gray-800 text-base">
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Confidentially hired CCO, COO, GM and other senior leaders</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Strengthened portfolio company leadership and market positioning</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Long-term retained partnership established for future investments</span></li>
                  </ul>
                </div>
                </article>
              </div>

              {/* Card 2 */}
              <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                <article className="case-study-card max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-md transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg">
                <span className="text-xs uppercase tracking-wider text-gray-500">Supporting global commercial expansion</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-gray-900 leading-[1.05]" style={{ fontFamily: 'Milker' }}>
                  From APAC to Global: Building a Commercial Team That Crossed Borders
                </h3>
                <p className="mt-6 text-gray-800 leading-relaxed text-lg">
                  A leading Indian CDMO worked with CDC to grow its global presence with multiple commercial individuals. We leveraged
                  our deep network across Europe and the US to source experienced sales, marketing, and commercial talent who could launch
                  and scale the brand internationally.
                </p>
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900">Key outcomes</h4>
                  <ul className="mt-4 space-y-3 text-gray-800 text-base">
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Hired 6 senior commercial leaders across 3 continents</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Reduced time-to-hire by 40%</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Helped establish CDMO in new locations</span></li>
                  </ul>
                </div>
                </article>
              </div>

              {/* Card 3 */}
              <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-6">
                <article className="case-study-card max-w-7xl mx-auto bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-8 md:p-14 lg:p-16 shadow-md transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg">
                <span className="text-xs uppercase tracking-wider text-gray-500">Full site build out</span>
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-gray-900 leading-[1.05]" style={{ fontFamily: 'Milker' }}>
                  Building from the Ground Up: Staffing a New Site from C-Suite to Scientists
                </h3>
                <p className="mt-6 text-gray-800 leading-relaxed text-lg">
                  A startup precision medicine company in San Francisco needed support from leadership to clinical scientists. With a tight
                  launch timeline, CDC embedded alongside the company’s leadership team to manage all hiring, from employer branding to offer
                  management.
                </p>
                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900">Key outcomes</h4>
                  <ul className="mt-4 space-y-3 text-gray-800 text-base">
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>45 hires in 5 months</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Complete team from Site Head to entry-level scientists</span></li>
                    <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 text-[#ff3a34]" /><span>Hiring complete ahead of schedule</span></li>
                  </ul>
                </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

