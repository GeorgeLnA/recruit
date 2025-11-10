import { ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import LifeSciencesIcons from "@/components/LifeSciencesIcons";

export default function AsAClient() {
  return (
    <>
    <div className="min-h-screen pt-48 px-8 relative" style={{ backgroundColor: '#FF914D' }}>
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
      {/* Back Button */}
      <a
        href="/work-with-us"
        className="fixed left-6 top-24 z-[2147483645] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow hover:shadow-md transition"
        aria-label="Back to Work With Us"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-bold">Back</span>
      </a>

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 2 }}>
        <div className="mb-24 flex items-center justify-center">
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

        <h1 className="text-8xl font-bold mb-16 text-center">
          Work With Us: As a Client
        </h1>
        <p className="text-xl text-white mb-20">
          CDC Global specialises in global recruitment across CDMO, CRO and diagnostics —
          covering commercial, technical and operational roles among others.
        </p>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8">Positions we recruit for</h2>
            <p className="text-white mb-8">Executive and senior leadership through functional heads and managers:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-white">
              <li>CEO, COO, CSO, CFO, CCO, CTO</li>
              <li>VP Commercial, VP Operations, VP Quality</li>
              <li>Head of Regulatory Affairs</li>
              <li>Head of Quality/QA/QMS</li>
              <li>Director of Manufacturing/Tech Ops</li>
              <li>Sales Directors & Regional Leaders</li>
              <li>Marketing Directors & Product Leaders</li>
              <li>Clinical & Laboratory Leadership</li>
            </ul>

            <h2 className="text-3xl font-bold mt-16 mb-8">Search solutions</h2>
            <ul className="space-y-6 text-white">
              <li><strong>Executive search:</strong> discreet, curated shortlists for critical hires</li>
              <li><strong>Volume search:</strong> scalable hiring for multi-role or multi-region growth</li>
              <li><strong>Marketing support:</strong> brand and talent marketing to accelerate outcomes</li>
            </ul>

            <h3 className="text-2xl font-bold mt-16 mb-6">Cost‑effective marketing to grow your business</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {['strategy','social media','training','copywriting','lead generation','website design'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-white border border-gray-200">{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <VideoPlayer
              src="/CDC Website - ROUGH CUT 1.mp4"
              poster="/placeholder.svg"
              title="What we offer to clients"
              className="w-full"
            />
            <p className="text-sm text-white mt-3">Short explainer from Harriet and Adam. Click Play to start.</p>
          </div>
        </div>

        <div className="mt-32 text-center">
          <a 
            href="/contact"
            className="inline-block px-8 py-4 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300"
            style={{ backgroundColor: '#00BFFF', fontSize: '1.25rem' }}
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

