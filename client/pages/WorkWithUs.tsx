import { MouseEvent, useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import VideoPlayer from "@/components/VideoPlayer";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import AmbientOrbs from "@/components/AmbientOrbs";

export default function WorkWithUs() {
  // Use URL hash to track which panel is active (persists on refresh and allows direct linking)
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const initialChecked = hash === '#candidate';
  
  const [checked, setChecked] = useState(initialChecked);
  const clientPanelRef = useRef<HTMLDivElement>(null);
  const candidatePanelRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showClient = !checked;
    const hidePanel = showClient ? candidatePanelRef.current : clientPanelRef.current;
    const showPanel = showClient ? clientPanelRef.current : candidatePanelRef.current;
    if (!hidePanel || !showPanel || !panelContainerRef.current) return;

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

    // Update URL hash without reload
    window.history.pushState(null, '', checked ? '#candidate' : '#client');
  }, [checked]);

  useEffect(() => {
    if (clientPanelRef.current && candidatePanelRef.current && panelContainerRef.current) {
      // Initial states
      gsap.set(clientPanelRef.current, { opacity: 1, x: 0, visibility: 'visible', position: 'absolute', inset: 0 });
      gsap.set(candidatePanelRef.current, { opacity: 0, x: 60, visibility: 'visible', position: 'absolute', inset: 0 });
      // Set container to current panel height
      const startHeight = (checked ? candidatePanelRef.current : clientPanelRef.current).scrollHeight;
      gsap.set(panelContainerRef.current, { height: startHeight });
    }
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.to(pageRef.current, {
      backgroundColor: checked ? '#ff3a34' : '#FF914D',
      duration: 0.5,
      ease: 'power2.out'
    });
  }, [checked]);

  // Tilt handlers for bullet cards
  const handleTilt = (e: MouseEvent<HTMLLIElement>) => {
    const el = e.currentTarget as HTMLLIElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2); // -1..1
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotateY = dx * 6;
    const rotateX = -dy * 6;
    gsap.to(el, { rotateX, rotateY, transformPerspective: 600, transformOrigin: 'center', duration: 0.2, ease: 'power2.out' });
  };

  const resetTilt = (e: MouseEvent<HTMLLIElement>) => {
    gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 0.3, ease: 'power2.out' });
  };

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
    <div ref={pageRef} className="relative min-h-screen pt-48 px-8 overflow-hidden" style={{ backgroundColor: initialChecked ? '#ff3a34' : '#FF914D' }}>
      <div className="max-w-7xl mx-auto">
        <AmbientOrbs tone={checked ? 'red' : 'peach'} />
        <h1 className="text-8xl font-bold mb-16 text-center" style={{ fontFamily: 'Milker' }}>
          Work With Us
        </h1>
        
        <div className="mb-24 flex items-center justify-center">
          <AnimatedSwitch
            checked={checked}
            onCheckedChange={(next) => setChecked(next)}
            leftLabel="As a client"
            rightLabel="As a candidate"
            leftActive={true}
          />
        </div>

        {/* Animated Panels */}
        <div ref={panelContainerRef} className="relative w-full pb-16">
          {/* Client Panel */}
          <div ref={clientPanelRef} className="overflow-visible">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="group">
                <h2 className="client-head text-4xl font-bold mb-8" style={{ fontFamily: 'Milker' }}>Solve my hiring headaches</h2>
                <ul className="client-bullets space-y-6 text-gray-900 text-lg">
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>1. Deep Industry Expertise</strong><br />
                    We live and breathe the Life Sciences sector — especially CDMO, CRO, and Diagnostics. Our market knowledge, network, and insights mean faster, smarter hires with less risk.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>2. Global Network, Personal Approach</strong><br />
                    With a 20,000+ LinkedIn network and long-standing industry relationships, we connect you to top talent worldwide — while providing a boutique, relationship-driven service.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>3. Precision Recruitment</strong><br />
                    We don’t just send CVs — we deliver the right people. Every search is built on deep understanding of your business goals, culture, and technical needs.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>4. Speed, Transparency & Trust</strong><br />
                    We move fast without cutting corners. You’ll always know where your search stands, with honest communication and consistent delivery you can rely on.
                  </li>
                </ul>

                <h2 className="text-3xl font-bold mb-8 mt-12" style={{ fontFamily: 'Milker' }}>Positions we recruit for</h2>
                <p className="text-gray-800 mb-8">Executive and senior leadership through functional heads and managers:</p>
                <ul className="client-positions grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-900">
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">CEO, COO, CSO, CFO, CCO, CTO</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">VP Commercial, VP Operations, VP Quality</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Head of Regulatory Affairs</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Head of Quality/QA/QMS</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Director of Manufacturing/Tech Ops</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Sales Directors & Regional Leaders</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Marketing Directors & Product Leaders</li>
                  <li className="bg-white/70 border border-white/60 rounded-lg px-4 py-3 hover:-translate-y-0.5 hover:shadow transition will-change-transform">Clinical & Laboratory Leadership</li>
                </ul>

                <h2 className="text-3xl font-bold mt-16 mb-8" style={{ fontFamily: 'Milker' }}>Search solutions</h2>
                <ul className="client-solutions space-y-6 text-gray-900">
                  <li className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm"> <strong>Executive search:</strong> discreet, curated shortlists for critical hires</li>
                  <li className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm"> <strong>Volume search:</strong> scalable hiring for multi-role or multi-region growth</li>
                  <li className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm"> <strong>Marketing support:</strong> brand and talent marketing to accelerate outcomes</li>
                </ul>

                <h3 className="text-2xl font-bold mt-16 mb-6" style={{ fontFamily: 'Milker' }}>Cost‑effective marketing to grow your business</h3>
                <div className="client-tags flex flex-wrap gap-3 text-sm">
                  {['strategy','social media','training','copywriting','lead generation','website design'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/80 text-gray-900 border border-white/60">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="client-video">
                <VideoPlayer
                  src="/placeholder.mp4"
                  poster="/placeholder.svg"
                  title="What we offer to clients"
                  className="w-full"
                />
                <p className="text-sm text-gray-700 mt-4">Short explainer from Harriet and Adam. Click Play to start.</p>
              </div>
            </div>
          </div>

          {/* Candidate Panel */}
          <div ref={candidatePanelRef} className="overflow-visible">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
                <h2 className="candidate-head text-4xl font-bold mb-8" style={{ fontFamily: 'Milker' }}>Find my dream role</h2>
                <ul className="candidate-bullets space-y-6 text-gray-900 text-lg">
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>1. Industry Insiders, Not Generalists</strong><br />
                    We specialise exclusively in Life Sciences — from CDMOs and CROs to Diagnostics. You’ll work with recruiters who truly understand your world, your skill set, and where you can go next.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>2. Real Opportunities, Not Random Roles</strong><br />
                    We only present positions that align with your goals, values, and expertise — no spam, no pressure. Every conversation is about fit, not just filling jobs.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>3. Guidance That Adds Value</strong><br />
                    From CV advice to interview prep and market insight, we’ll help you navigate your next move with clarity and confidence.
                  </li>
                  <li onMouseMove={handleTilt} onMouseLeave={resetTilt} className="bg-white/80 border border-white/60 rounded-xl p-5 shadow-sm transition-transform will-change-transform hover:-translate-y-1 hover:shadow-lg" style={{ transformStyle: 'preserve-3d' }}>
                    <strong>4. Confidentiality & Honesty Always</strong><br />
                    Your trust matters. We keep every conversation discreet and communicate openly — so you always know where you stand.
                  </li>
                </ul>
                <div className="candidate-cta mt-16">
                  <a
                    href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-900 font-bold"
                    style={{ fontFamily: 'Milker' }}
                  >
                    View open roles on LinkedIn
                  </a>
                </div>
              </div>
              <div className="candidate-video">
                <VideoPlayer
                  src="/placeholder.mp4"
                  poster="/placeholder.svg"
                  title="What we offer to candidates"
                  className="w-full"
                />
                <p className="text-sm text-gray-700 mt-4">Short explainer from Harriet and Adam. Click Play to start.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Extra spacing before footer */}
        <div className="h-32"></div>
      </div>
    </div>
    <Footer />
    </>
  );
}

