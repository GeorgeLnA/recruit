import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

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

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden text-white min-h-screen"
      style={{ backgroundColor: "#00BFFF" }}
    >
      {/* Top Section */}
      <div className="relative z-10 flex items-start justify-end px-6 lg:px-12 pt-12 pb-8">
        <button
          data-footer-top
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-lg bg-white text-black flex items-center justify-center transition-all hover:scale-110 shadow-lg"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Columns */}
      <div className="relative z-10 px-6 lg:px-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 max-w-[98vw] mx-auto">
          {/* Column 1: CDC Global Address */}
          <div data-footer-col>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">CDC GLOBAL</h4>
            <div className="text-white text-sm space-y-2">
              <p>65 Arthurs Avenue, Harrogate, North Yorkshire, United Kingdom, HG2 0EB</p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div data-footer-col>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">NAVIGATION</h4>
            <div className="space-y-2">
              <a href="/" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                HOME
              </a>
              <a href="#expertises" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                EXPERTISES
              </a>
              <a href="#about" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                ABOUT
              </a>
              <a href="/work-with-us" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                WORK WITH US
              </a>
              <a href="/global-reach" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                GLOBAL REACH
              </a>
              <a
                href="/proof-in-the-people"
                className="block text-white text-sm uppercase hover:opacity-70 transition-opacity"
              >
                PROOF IN THE PEOPLE
              </a>
              <a href="/candid-moments" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                CANDID MOMENTS
              </a>
              <a href="/contact" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                CONTACT
              </a>
            </div>
          </div>

 	    {/* Column 3: Work With Us */}
          <div data-footer-col>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">WORK WITH US</h4>
            <div className="space-y-2">
              <a href="/work-with-us#client" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                AS A CLIENT
              </a>
              <a
                href="/work-with-us#candidate"
                className="block text-white text-sm uppercase hover:opacity-70 transition-opacity"
              >
                AS A CANDIDATE
              </a>
            </div>
          </div>

          {/* Column 4: Contact & Follow */}
          <div data-footer-col>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">CONTACT</h4>
            <div className="space-y-2 mb-6">
              <a href="tel:+447554440299" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                07554 440 299
              </a>
              <a
                href="mailto:harriet@cdcglobal.co.uk"
                className="block text-white text-sm uppercase hover:opacity-70 transition-opacity"
              >
                harriet@cdcglobal.co.uk
              </a>
              <a href="mailto:adam@cdcglobal.co.uk" className="block text-white text-sm uppercase hover:opacity-70 transition-opacity">
                adam@cdcglobal.co.uk
              </a>
            </div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 mt-6">FOLLOW</h4>
            <div className="space-y-2">
              <a
                href="https://www.linkedin.com/company/cdcglobal/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white text-sm uppercase hover:opacity-70 transition-opacity"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Large Background Logo */}
      <div className="pointer-events-none select-none absolute inset-x-0 bottom-0 text-center text-white/10 font-bold leading-none tracking-tight" style={{ fontSize: "clamp(120px, 25vw, 400px)", lineHeight: "0.9" }}>
        <div className="-translate-y-[20%]">CDC GLOBAL</div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 px-6 lg:px-12 py-6">
        <div
          data-footer-head
          className="text-white font-bold leading-[0.9] mb-6 w-full text-center"
          style={{
            fontSize: "clamp(4rem, 15vw, 18rem)",
            padding: "0 1rem",
          }}
        >
          <div className="w-full flex justify-center">
            <span className="whitespace-nowrap">CDC GLOBAL</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-[98vw] mx-auto">
          <div data-footer-bottom className="text-white text-sm">
            <p className="font-bold">©{currentYear} CDC GLOBAL SOLUTIONS LTD</p>
          </div>
          <div data-footer-bottom className="flex gap-4 text-white text-sm uppercase">
            <a href="#" className="hover:opacity-70 transition-opacity">
              LEGAL
            </a>
            <span>—</span>
            <a href="#" className="hover:opacity-70 transition-opacity">
              PRIVACY
            </a>
            <span>—</span>
            <a href="#" className="hover:opacity-70 transition-opacity">
              COOKIES
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
