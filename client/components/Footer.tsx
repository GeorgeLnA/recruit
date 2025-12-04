import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import ClientLogoMarquee from "@/components/ClientLogoMarquee";
import { gsap } from "@/lib/gsap";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !footerRef.current || typeof IntersectionObserver === "undefined") {
      return;
    }

    const footer = footerRef.current;
    const head = footer.querySelector<HTMLElement>("[data-footer-head]");
    const topButton = footer.querySelector<HTMLElement>("[data-footer-top]");
    const cols = Array.from(footer.querySelectorAll<HTMLElement>("[data-footer-col]"));
    const bottom = Array.from(footer.querySelectorAll<HTMLElement>("[data-footer-bottom]"));

    const setInitialState = () => {
      if (head) {
        head.style.opacity = "0";
        head.style.transform = "translateY(20px)";
      }
      if (topButton) {
        topButton.style.opacity = "0";
        topButton.style.transform = "translateY(20px)";
      }
      cols.forEach((col) => {
        col.style.opacity = "0";
        col.style.transform = "translateY(30px)";
      });
      bottom.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      });
    };

    setInitialState();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (head) {
            setTimeout(() => {
              head.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
              head.style.opacity = "1";
              head.style.transform = "translateY(0)";
            }, 100);
          }

          if (topButton) {
            setTimeout(() => {
              topButton.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
              topButton.style.opacity = "1";
              topButton.style.transform = "translateY(0)";
            }, 100);
          }

          cols.forEach((col, index) => {
            setTimeout(() => {
              col.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
              col.style.opacity = "1";
              col.style.transform = "translateY(0)";
            }, 200 + index * 100);
          });

          bottom.forEach((el, index) => {
            setTimeout(() => {
              el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, 400 + index * 100);
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  // Add shake animation on hover for back to top button
  useEffect(() => {
    const button = backToTopRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      // Scale up on hover
      button.style.transform = 'scale(1.1)';
      // Shake animation with rotation
      gsap.to(button, {
        rotation: -20,
        duration: 0.015,
        ease: 'power2.out',
        yoyo: true,
        repeat: 6
      });
    };

    const handleMouseLeave = () => {
      gsap.killTweensOf(button);
      // Reset scale and rotation
      gsap.to(button, {
        rotation: 0,
        scale: 1,
        duration: 0.1,
        ease: 'power2.out',
        onComplete: () => {
          button.style.transform = 'scale(1)';
        }
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Client Logo Marquee Section */}
      <section className="w-full bg-[var(--color-blue)] overflow-visible" style={{ paddingTop: 'clamp(60px, 8vw, 120px)', paddingBottom: 'clamp(20px, 3vw, 40px)' }}>
        <div className="container mx-auto px-6 lg:px-8 overflow-visible" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
          <ClientLogoMarquee 
            speedSeconds={50}
            pauseOnHover={true}
            rows={1}
            className="[&_.marquee]:pt-0 [&_.marquee]:pb-0 [&_.marquee]:overflow-visible"
          />
        </div>
      </section>

      <footer
        ref={footerRef}
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: "var(--color-blue)", minHeight: 'clamp(400px, 50vh, 100vh)' }}
      >
      {/* Main Content Columns */}
      <div className="relative z-10 px-6 lg:px-12" style={{ paddingTop: 'clamp(40px, 6vw, 80px)', paddingBottom: 'clamp(40px, 6vw, 80px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-full mx-auto" style={{ alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
          {/* Column 1: CDC Global Address */}
          <div data-footer-col>
            <h4 className="text-white font-bold tracking-wider mb-4" style={{ fontSize: 'clamp(12px, 1.25vw, 14px)' }}>CDC Global</h4>
            <div className="text-white" style={{ fontSize: 'clamp(11px, 1vw, 14px)', lineHeight: '1.5' }}>
              <p>Meydan Grandstand, 6th Floor, Meydan Road, Nad Al Sheba, Dubai, U.A.E.</p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div data-footer-col>
            <h4 className="text-white font-bold tracking-wider mb-4" style={{ fontSize: 'clamp(12px, 1.25vw, 14px)' }}>Navigation</h4>
            <div className="space-y-2">
              <a href="/" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Home
              </a>
              <a href="/work-with-us" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Work With Us
              </a>
              <a href="/global-reach" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Global Reach
              </a>
              <a
                href="/proof-in-the-people"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
              >
                Proof in the People
              </a>
              <a href="/candid-moments" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Candid Moments
              </a>
              <a href="/contact" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Contact
              </a>
            </div>
          </div>

 	    {/* Column 3: Work With Us */}
          <div data-footer-col>
            <h4 className="text-white font-bold tracking-wider mb-4" style={{ fontSize: 'clamp(12px, 1.25vw, 14px)' }}>Work With Us</h4>
            <div className="space-y-2">
              <a href="/work-with-us#client" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                As a Client
              </a>
              <a
                href="/work-with-us#candidate"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
              >
                As a Candidate
              </a>
            </div>
          </div>

          {/* Column 4: Contact & Follow */}
          <div data-footer-col className="relative">
            {/* Back to Top Button - aligned with Contact heading on desktop, moved to top of big text on mobile */}
            <div className="absolute top-0 right-0 md:block hidden">
              <button
                ref={backToTopRef}
                data-footer-top
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-lg bg-white text-black flex items-center justify-center shadow-lg"
                aria-label="Back to top"
                style={{ 
                  width: 'clamp(40px, 3vw, 48px)', 
                  height: 'clamp(40px, 3vw, 48px)'
                }}
              >
                <ArrowUp style={{ width: 'clamp(16px, 1.5vw, 20px)', height: 'clamp(16px, 1.5vw, 20px)' }} />
              </button>
            </div>
            <h4 className="text-white font-bold tracking-wider mb-4" style={{ fontSize: 'clamp(12px, 1.25vw, 14px)' }}>Contact</h4>
            <div className="space-y-2 mb-6">
              <a href="tel:+447554440299" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)', wordBreak: 'break-all' }}>
                07554 440 299
              </a>
              <a
                href="mailto:harriet@cdcglobal.co.uk"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)', wordBreak: 'break-all' }}
              >
                harriet@cdcglobal.co.uk
              </a>
              <a href="mailto:adam@cdcglobal.co.uk" className="block text-white hover:opacity-70 transition-opacity" style={{ fontSize: 'clamp(11px, 1vw, 14px)', wordBreak: 'break-all' }}>
                adam@cdcglobal.co.uk
              </a>
            </div>
            <h4 className="text-white font-bold tracking-wider mb-4 mt-6" style={{ fontSize: 'clamp(12px, 1.25vw, 14px)' }}>Follow</h4>
            <div className="space-y-2">
              <a
                href="https://www.linkedin.com/company/cdcglobal/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
              >
                LinkedIn
              </a>
              <a
                href="https://www.linkedin.com/in/harriet-wheat/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
              >
                Harriet's LinkedIn
              </a>
              <a
                href="https://www.linkedin.com/in/adam-hargreaves-ivd/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white hover:opacity-70 transition-opacity"
                style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}
              >
                Adam's LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 px-6 lg:px-12" style={{ paddingTop: 'clamp(24px, 3vw, 24px)', paddingBottom: 'clamp(24px, 3vw, 24px)' }}>
        {/* Back to Top Button - Mobile only, positioned at top of big text */}
        <div className="md:hidden flex justify-end mb-1">
          <button
            data-footer-top
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-lg bg-white text-black flex items-center justify-center shadow-lg"
            aria-label="Back to top"
            style={{ 
              width: 'clamp(40px, 3vw, 48px)', 
              height: 'clamp(40px, 3vw, 48px)',
              transition: 'transform 0.3s ease-out, scale 0.3s ease-out',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ArrowUp style={{ width: 'clamp(16px, 1.5vw, 20px)', height: 'clamp(16px, 1.5vw, 20px)' }} />
          </button>
        </div>
        <div
          data-footer-head
          className="text-white font-bold leading-[0.9] w-full text-center"
          style={{
            fontSize: "clamp(2.5rem, 12vw, 18rem)",
            padding: "0 clamp(8px, 1vw, 16px)",
            marginBottom: 'clamp(8px, 1vw, 24px)',
            overflow: 'hidden',
            wordBreak: 'break-word'
          }}
        >
          <div className="w-full flex justify-center">
            <span className="whitespace-nowrap" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>Cdc Global</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1 md:gap-4 max-w-full mx-auto" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div data-footer-bottom className="text-white" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
            <p className="font-bold">©{currentYear} CDC Global Solutions</p>
          </div>
          <div data-footer-bottom className="flex gap-4 text-white" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
            <a href="/privacy-policy" className="hover:opacity-70 transition-opacity">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
