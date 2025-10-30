import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Tone = "peach" | "red";

interface AmbientOrbsProps {
  tone?: Tone;
  className?: string;
}

export default function AmbientOrbs({ tone = "peach", className = "" }: AmbientOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const orbs = Array.from(containerRef.current.querySelectorAll(".orb"));

    orbs.forEach((el, i) => {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      const dx = 40 + i * 20;
      const dy = 30 + i * 15;
      tl.to(el, {
        x: `+=${dx}`,
        y: `-=${dy}`,
        duration: 6 + i * 1.5,
        ease: "sine.inOut",
      }).to(el, {
        x: `-=${dx * 1.5}`,
        y: `+=${dy * 1.2}`,
        duration: 7 + i * 1.5,
        ease: "sine.inOut",
      });
    });
  }, { scope: containerRef });

  const colors = tone === "red"
    ? ["rgba(255,58,52,0.40)", "rgba(255,140,120,0.35)", "rgba(255,210,200,0.25)"]
    : ["rgba(255,145,77,0.40)", "rgba(255,200,160,0.35)", "rgba(255,235,210,0.25)"];

  return (
    <div ref={containerRef} className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <div className="orb absolute -top-24 -left-24 w-80 h-80 blur-3xl" style={{ background: `radial-gradient(closest-side, ${colors[0]} 0%, transparent 70%)` }} />
      <div className="orb absolute top-1/3 -right-16 w-96 h-96 blur-3xl" style={{ background: `radial-gradient(closest-side, ${colors[1]} 0%, transparent 70%)` }} />
      <div className="orb absolute bottom-0 left-1/4 w-[28rem] h-[28rem] blur-3xl" style={{ background: `radial-gradient(closest-side, ${colors[2]} 0%, transparent 70%)` }} />
    </div>
  );
}


