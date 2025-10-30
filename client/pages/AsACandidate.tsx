import { ArrowLeft } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import Footer from "@/components/Footer";
import AnimatedSwitch from "@/components/AnimatedSwitch";

export default function AsACandidate() {
  return (
    <>
    <div className="min-h-screen pt-48 px-8" style={{ backgroundColor: '#FF914D' }}>
      {/* Back Button */}
      <a
        href="/work-with-us"
        className="fixed left-6 top-24 z-[2147483645] inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow hover:shadow-md transition"
        aria-label="Back to Work With Us"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-bold" style={{ fontFamily: 'Milker' }}>Back</span>
      </a>

      <div className="max-w-7xl mx-auto">
        <div className="mb-24 flex items-center justify-center">
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

        <h1 className="text-8xl font-bold mb-16 text-center" style={{ fontFamily: 'Milker' }}>
          Work With Us: As a Candidate
        </h1>
        <p className="text-xl text-white mb-20">
          We position you confidentially into organisations aligned with your niche — across CDMO, CRO and diagnostics —
          tailoring introductions to your ambitions and experience.
        </p>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Milker' }}>How we help candidates</h2>
            <ul className="space-y-6 text-white">
              <li>Confidential representation to relevant hiring leaders</li>
              <li>Advice on positioning, narrative and market mapping</li>
              <li>Curated introductions across commercial, technical and operations</li>
              <li>Guidance through interview, offer and onboarding</li>
            </ul>
          </div>
          <div>
            <VideoPlayer
              src="/placeholder.mp4"
              poster="/placeholder.svg"
              title="What we offer to candidates"
              className="w-full"
            />
            <p className="text-sm text-white mt-3">Short explainer from Harriet and Adam. Click Play to start.</p>
          </div>
        </div>

        <div className="mt-32">
          <a
            href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition text-white font-bold"
            style={{ fontFamily: 'Milker' }}
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

