import { ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";

export default function AsACandidate() {
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
            checked={false}
            onCheckedChange={(checked) => {
              if (checked) window.location.href = "/work-with-us/as-a-client";
            }}
            leftLabel="As a client"
            rightLabel="As a candidate"
            leftActive={true}
          />
        </div>

        <h1 className="font-bold text-center" style={{ fontSize: 'clamp(48px, 5vw, 96px)', marginBottom: 'clamp(40px, 4vw, 64px)' }}>
          Work With Us: As a Candidate
        </h1>
        <p className="text-white" style={{ fontSize: 'clamp(16px, 1.25vw, 20px)', marginBottom: 'clamp(60px, 5vw, 80px)' }}>
          We position you confidentially into organisations aligned with your niche — across CDMO, CRO and diagnostics —
          tailoring introductions to your ambitions and experience.
        </p>

        <div className="grid md:grid-cols-2" style={{ gap: 'clamp(48px, 4vw, 64px)' }}>
          <div>
            <h2 className="font-bold" style={{ fontSize: 'clamp(24px, 2vw, 32px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>How we help candidates</h2>
            <ul className="text-white" style={{ gap: 'clamp(16px, 1.5vw, 24px)', fontSize: 'clamp(14px, 1vw, 18px)', display: 'flex', flexDirection: 'column' }}>
              <li>Confidential representation to relevant hiring leaders</li>
              <li>Advice on positioning, narrative and market mapping</li>
              <li>Curated introductions across commercial, technical and operations</li>
              <li>Guidance through interview, offer and onboarding</li>
            </ul>
          </div>
          <div>
            <VideoPlayer
              src="/vids/Clients.webm"
              poster="/vids/thumbnails/CLIENTS.jpg"
              title="What we offer to candidates"
              className="w-full"
            />
            <p className="text-white" style={{ fontSize: 'clamp(12px, 0.875vw, 14px)', marginTop: 'clamp(12px, 1vw, 16px)' }}>Short explainer from Harriet and Adam. Click Play to start.</p>
          </div>
        </div>

        <div style={{ marginTop: 'clamp(80px, 8vw, 128px)' }}>
          <a
            href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-white font-bold"
            style={{ gap: 'clamp(8px, 0.75vw, 12px)', paddingLeft: 'clamp(24px, 1.5vw, 24px)', paddingRight: 'clamp(24px, 1.5vw, 24px)', paddingTop: 'clamp(12px, 0.75vw, 12px)', paddingBottom: 'clamp(12px, 0.75vw, 12px)', fontSize: 'clamp(14px, 1vw, 18px)' }}
          >
            View open roles on LinkedIn
          </a>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

