import { ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";

export default function AsAClient() {
  return (
    <>
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-peach)', paddingTop: 'clamp(120px, 12vw, 192px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}>
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
      {/* Back Button */}
      <a
        href="/work-with-us"
        className="fixed z-[2147483645] inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 shadow hover:shadow-md transition"
        style={{ left: 'clamp(24px, 3vw, 48px)', top: 'clamp(96px, 6vw, 144px)', paddingLeft: 'clamp(12px, 1.5vw, 16px)', paddingRight: 'clamp(12px, 1.5vw, 16px)', paddingTop: 'clamp(8px, 1vw, 12px)', paddingBottom: 'clamp(8px, 1vw, 12px)' }}
        aria-label="Back to Work With Us"
      >
        <ArrowLeft style={{ width: 'clamp(14px, 1vw, 16px)', height: 'clamp(14px, 1vw, 16px)' }} />
        <span className="font-bold" style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}>Back</span>
      </a>

      <div className="mx-auto relative" style={{ zIndex: 2, maxWidth: '1400px' }}>
        <div className="flex items-center justify-center" style={{ marginBottom: 'clamp(60px, 6vw, 96px)' }}>
          <AnimatedSwitch
            checked={true}
            onCheckedChange={(checked) => {
              if (!checked) window.location.href = "/work-with-us/as-a-candidate";
            }}
            leftLabel="As a client"
            rightLabel="As a candidate"
            leftActive={true}
          />
        </div>

        <h1 className="font-bold text-center" style={{ fontSize: 'clamp(48px, 5vw, 96px)', marginBottom: 'clamp(40px, 4vw, 64px)' }}>
          Work With Us: As a Client
        </h1>
        <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 20px)', marginBottom: 'clamp(60px, 5vw, 80px)' }}>
          CDC Global specialises in global recruitment across CDMO, CRO and diagnostics —
          covering commercial, technical and operational roles among others.
        </p>

        <div className="grid md:grid-cols-2" style={{ gap: 'clamp(48px, 4vw, 64px)' }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>Positions we recruit for</h2>
            <p className="text-white" style={{ fontSize: 'clamp(14px, 1vw, 18px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>Executive and senior leadership through functional heads and managers:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 text-white" style={{ gap: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1vw, 18px)' }}>
              <li>CEO, COO, CSO, CFO, CCO, CTO</li>
              <li>VP Commercial, VP Operations, VP Quality</li>
              <li>Head of Regulatory Affairs</li>
              <li>Head of Quality/QA/QMS</li>
              <li>Director of Manufacturing/Tech Ops</li>
              <li>Sales Directors & Regional Leaders</li>
              <li>Marketing Directors & Product Leaders</li>
              <li>Clinical & Laboratory Leadership</li>
            </ul>

            <h2 className="font-bold" style={{ fontSize: 'clamp(24px, 2vw, 32px)', marginTop: 'clamp(48px, 4vw, 64px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>Search solutions</h2>
            <ul className="text-white" style={{ gap: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1vw, 18px)', display: 'flex', flexDirection: 'column' }}>
              <li><strong>Executive search:</strong> discreet, curated shortlists for critical hires</li>
              <li><strong>Volume search:</strong> scalable hiring for multi-role or multi-region growth</li>
              <li><strong>Marketing support:</strong> brand and talent marketing to accelerate outcomes</li>
            </ul>

            <h3 className="font-bold" style={{ fontSize: 'clamp(20px, 1.75vw, 28px)', marginTop: 'clamp(48px, 4vw, 64px)', marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>Cost‑effective marketing to grow your business</h3>
            <div className="flex flex-wrap" style={{ gap: 'clamp(8px, 0.75vw, 12px)' }}>
              {['strategy','social media','training','copywriting','lead generation','website design'].map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 text-white border border-gray-200" style={{ paddingLeft: 'clamp(12px, 1vw, 16px)', paddingRight: 'clamp(12px, 1vw, 16px)', paddingTop: 'clamp(4px, 0.5vw, 8px)', paddingBottom: 'clamp(4px, 0.5vw, 8px)', fontSize: 'clamp(11px, 0.875vw, 14px)' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <VideoPlayer
              src="/CDC Website - ROUGH CUT 1 (1).webm"
              poster="/placeholder.svg"
              title="What we offer to clients"
              className="w-full"
            />
            <p className="text-white" style={{ fontSize: 'clamp(12px, 0.875vw, 14px)', marginTop: 'clamp(12px, 1vw, 16px)' }}>Short explainer from Harriet and Adam. Click Play to start.</p>
          </div>
        </div>

        <div className="text-center" style={{ marginTop: 'clamp(80px, 8vw, 128px)' }}>
          <a 
            href="/contact"
            className="inline-block text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: 'var(--color-blue)', paddingLeft: 'clamp(32px, 2.5vw, 32px)', paddingRight: 'clamp(32px, 2.5vw, 32px)', paddingTop: 'clamp(16px, 1.25vw, 16px)', paddingBottom: 'clamp(16px, 1.25vw, 16px)', fontSize: 'clamp(16px, 1.25vw, 20px)' }}
          >
            Get Started Today
          </a>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

