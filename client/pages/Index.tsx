import { ArrowRight, Mail } from "lucide-react";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import MobileMessage from "@/components/MobileMessage";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [aboutSectionProgress, setAboutSectionProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        // Calculate progress from 0 to 1 over the hero height
        // Use a more gradual curve for the empty section effect
        const progress = Math.min(Math.max(scrollY / (heroHeight * 1.5), 0), 1);
        setScrollProgress(progress);
      }

      // Compute local progress for the video morphing section (0..1 within that section)
      if (videoSectionRef.current) {
        const sectionTop = videoSectionRef.current.offsetTop;
        const sectionHeight = videoSectionRef.current.offsetHeight || 1;
        const local = Math.min(Math.max((scrollY - sectionTop) / sectionHeight, 0), 1);
        setVideoProgress(local);
      }

      // Compute local progress for the about section (0..1 within that section)
      if (aboutSectionRef.current) {
        const sectionTop = aboutSectionRef.current.offsetTop;
        const sectionHeight = aboutSectionRef.current.offsetHeight || 1;
        // Start expansion 900px before reaching the section
        const adjustedTop = sectionTop - 900;
        const local = Math.min(Math.max((scrollY - adjustedTop) / sectionHeight, 0), 1);
        setAboutSectionProgress(local);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const damping = 0.3; // 30% damping
    const animationFrame = requestAnimationFrame(() => {
      setCirclePosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * damping,
        y: prev.y + (mousePosition.y - prev.y) * damping
      }));
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [mousePosition]);

  // Helper functions for video shape morphing (based on videoProgress within grey section)
  const getVideoBorderRadius = (progress: number) => {
    if (progress < 0.33) return '0px'; // Rectangle (no radius)
    if (progress < 0.66) return '0px'; // Cloud (handled by clip-path)
    return '50%'; // Circle
  };

  const getVideoClipPath = (progress: number) => {
    if (progress < 0.33) return 'none'; // Rectangle (no clip-path)
    if (progress < 0.66) return 'url(#cloudClip)'; // Cloud shape (base)
    return 'none'; // Circle (handled by border-radius)
  };

  // Crossfade helpers for three cloud variants (A -> B -> C) across full range
  const cloudStageProgress = Math.min(Math.max(videoProgress, 0), 1);
  const cloudOpacityA = cloudStageProgress < 0.5 ? 1 - cloudStageProgress / 0.5 : 0;
  const cloudOpacityB = cloudStageProgress < 0.5
    ? cloudStageProgress / 0.5
    : 1 - (cloudStageProgress - 0.5) / 0.5;
  const cloudOpacityC = cloudStageProgress < 0.5 ? 0 : (cloudStageProgress - 0.5) / 0.5;

  // Text morphing based on video progress (3 different messages)
  const getMorphingText = (progress: number) => {
    if (progress < 0.33) {
      return "We work with recruitment companies to show what marketing can do.";
    } else if (progress < 0.66) {
      return "We help recruitment firms transform their approach through strategic marketing.";
    } else {
      return "We turn recruitment challenges into marketing opportunities that deliver results.";
    }
  };

  // Small motion offsets for detached bubbles (scroll-coupled)
  const bubble1OffsetX = Math.sin(videoProgress * Math.PI * 2) * 16;
  const bubble1OffsetY = Math.cos(videoProgress * Math.PI * 2) * 10;
  const bubble2OffsetX = Math.cos(videoProgress * Math.PI * 2 + 0.8) * 14;
  const bubble2OffsetY = Math.sin(videoProgress * Math.PI * 2 + 0.8) * 12;
  const bubble3OffsetX = Math.sin(videoProgress * Math.PI * 2 + 1.6) * 12;
  const bubble3OffsetY = Math.cos(videoProgress * Math.PI * 2 + 1.6) * 9;
  const bubble4OffsetX = Math.cos(videoProgress * Math.PI * 2 + 2.4) * 10;
  const bubble4OffsetY = Math.sin(videoProgress * Math.PI * 2 + 2.4) * 8;

  // Actual morph path generator for a cloud shape
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const wrapAngle = (d: number) => {
    let x = d;
    while (x > Math.PI) x -= 2 * Math.PI;
    while (x < -Math.PI) x += 2 * Math.PI;
    return x;
  };

  // Three cloud style presets (amplitudes around 8 lobes for richer shape)
  const lobeAngles = [0, 45, 90, 135, 180, 225, 270, 315].map(toRadians);
  const ampsA = [0.18, 0.10, 0.14, 0.08, 0.16, 0.11, 0.13, 0.09];
  const ampsB = [0.12, 0.17, 0.09, 0.15, 0.10, 0.16, 0.08, 0.14];
  const ampsC = [0.20, 0.12, 0.18, 0.10, 0.17, 0.13, 0.16, 0.11];

  function getAmplitudes(t: number): number[] {
    // 0..0.5: A->B, 0.5..1: B->C
    if (t < 0.5) {
      const k = t / 0.5;
      return ampsA.map((a, i) => lerp(a, ampsB[i], k));
    }
    const k = (t - 0.5) / 0.5;
    return ampsB.map((b, i) => lerp(b, ampsC[i], k));
  }

  function gaussian(x: number, sigma: number) {
    return Math.exp(-(x * x) / (2 * sigma * sigma));
  }

  function getRadiusAtAngle(theta: number, t: number): number {
    // Breathing base and dynamic phase to avoid a static oval
    const base = 0.26 + 0.02 * Math.sin(t * Math.PI * 2);
    const amps = getAmplitudes(t);
    const phase = (t * Math.PI * 2) * 0.6; // rotate bumps with progress

    // Main lobes
    let bump = 0;
    for (let i = 0; i < lobeAngles.length; i++) {
      const d = wrapAngle((theta + phase) - lobeAngles[i]);
      bump += amps[i] * gaussian(d, 0.33); // slightly tighter
    }

    // Stronger side bubbles (left/right) to feel cloudier
    const sideAngles = [Math.PI / 2, (3 * Math.PI) / 2]; // 90°, 270°
    let sideBumps = 0;
    const sideAmp = 0.06 + 0.05 * Math.sin(t * Math.PI * 2);
    for (let i = 0; i < sideAngles.length; i++) {
      const d = wrapAngle((theta + phase * 0.8) - sideAngles[i]);
      sideBumps += sideAmp * gaussian(d, 0.22); // sharp, pronounced side scallops
    }

    // Micro-lobes all around for texture
    let micro = 0;
    const microCount = 12;
    const microAmpBase = 0.012;
    for (let i = 0; i < microCount; i++) {
      const ang = (i / microCount) * Math.PI * 2 + 0.3 * Math.sin(t * Math.PI * 2);
      const d = wrapAngle((theta + phase * 1.1) - ang);
      const amp = microAmpBase * (1 + 0.5 * Math.cos(ang * 3 + t * Math.PI * 2));
      micro += amp * gaussian(d, 0.16);
    }

    // A gentle second harmonic for extra character
    const harmonic = 0.02 * Math.cos(2 * (theta + phase + 0.4));

    return base + bump * 0.30 + sideBumps + micro + harmonic;
  }

  function pointsForCloud(t: number, numPoints = 80) {
    // Subtle center drift and squash variation
    const cx = 0.55 + 0.02 * Math.sin(t * Math.PI * 2);
    const cy = 0.55 + 0.02 * Math.cos(t * Math.PI * 2);
    const squashY = 0.75 + 0.1 * Math.cos(t * Math.PI * 2);
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * Math.PI * 2;
      const r = getRadiusAtAngle(theta, t);
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta) * squashY; // dynamic vertical squash
      pts.push({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    }
    return pts;
  }

  // Convert closed Catmull-Rom to cubic Bezier path string
  function catmullRom2bezierPath(pts: { x: number; y: number }[], tension = 0.5) {
    const p = pts;
    const n = p.length;
    if (n < 3) return '';
    const c = (i: number) => p[(i + n) % n];
    let d = `M ${c(0).x} ${c(0).y}`;
    for (let i = 0; i < n; i++) {
      const p0 = c(i - 1);
      const p1 = c(i);
      const p2 = c(i + 1);
      const p3 = c(i + 2);
      const cp1x = p1.x + (p2.x - p0.x) * (tension / 6);
      const cp1y = p1.y + (p2.y - p0.y) * (tension / 6);
      const cp2x = p2.x - (p3.x - p1.x) * (tension / 6);
      const cp2y = p2.y - (p3.y - p1.y) * (tension / 6);
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    d += ' Z';
    return d;
  }

  function getCloudMorphPath(t: number) {
    const pts = pointsForCloud(t, 80);
    return catmullRom2bezierPath(pts, 0.6);
  }

  // Seeded variant generator for unique bubble morphs
  function rand(seed: number, i: number): number {
    const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function getCloudMorphPathSeeded(t: number, seed: number) {
    // Variant parameters derived from seed
    const lobeAnglesDeg = [0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => deg + (rand(seed, i) - 0.5) * 25);
    const variantLobeAngles = lobeAnglesDeg.map(toRadians);
    const mulA = (i: number) => 0.85 + rand(seed + 11, i) * 0.45;
    const mulB = (i: number) => 0.85 + rand(seed + 23, i) * 0.45;
    const mulC = (i: number) => 0.85 + rand(seed + 37, i) * 0.45;
    const vAmpsA = [0.18, 0.10, 0.14, 0.08, 0.16, 0.11, 0.13, 0.09].map((a, i) => a * mulA(i));
    const vAmpsB = [0.12, 0.17, 0.09, 0.15, 0.10, 0.16, 0.08, 0.14].map((a, i) => a * mulB(i));
    const vAmpsC = [0.20, 0.12, 0.18, 0.10, 0.17, 0.13, 0.16, 0.11].map((a, i) => a * mulC(i));
    const phaseMul = 0.5 + rand(seed, 99) * 0.8;
    const baseRadius = 0.25 + rand(seed, 77) * 0.04;
    const baseBreath = 0.015 + rand(seed, 88) * 0.02;
    const sigma = 0.28 + rand(seed, 55) * 0.1;
    const microCount = 10 + Math.floor(rand(seed, 66) * 8);
    const microAmp = 0.009 + rand(seed, 44) * 0.01;
    const microSigma = 0.13 + rand(seed, 33) * 0.05;
    const harmonicAmp = 0.015 + rand(seed, 22) * 0.012;
    const harmonicPhase = rand(seed, 21) * 1.2;
    const centerDrift = 0.012 + rand(seed, 13) * 0.015;
    const squashBase = 0.72 + rand(seed, 5) * 0.14;
    const squashVar = 0.06 + rand(seed, 6) * 0.07;

    function getVariantAmps(progress: number): number[] {
      if (progress < 0.5) {
        const k = progress / 0.5;
        return vAmpsA.map((a, i) => lerp(a, vAmpsB[i], k));
      }
      const k = (progress - 0.5) / 0.5;
      return vAmpsB.map((b, i) => lerp(b, vAmpsC[i], k));
    }

    function getVariantRadius(theta: number, progress: number): number {
      const base = baseRadius + baseBreath * Math.sin(progress * Math.PI * 2 + harmonicPhase);
      const amps = getVariantAmps(progress);
      const phase = (progress * Math.PI * 2) * phaseMul;
      let bump = 0;
      for (let i = 0; i < variantLobeAngles.length; i++) {
        const d = wrapAngle((theta + phase) - variantLobeAngles[i]);
        bump += amps[i] * gaussian(d, sigma);
      }
      // micro texture
      let micro = 0;
      for (let i = 0; i < microCount; i++) {
        const ang = (i / microCount) * Math.PI * 2 + 0.3 * Math.sin(progress * Math.PI * 2 + i * 0.11);
        const d = wrapAngle((theta + phase * 1.05) - ang);
        const amp = microAmp * (1 + 0.5 * Math.cos(ang * 3 + progress * Math.PI * 2));
        micro += amp * gaussian(d, microSigma);
      }
      const harmonic = harmonicAmp * Math.cos(2 * (theta + phase + 0.4 + harmonicPhase));
      return base + bump * 0.32 + micro + harmonic;
    }

    function variantPoints(progress: number, numPoints = 72) {
      const cx = 0.55 + centerDrift * Math.sin(progress * Math.PI * 2 + 0.3);
      const cy = 0.55 + centerDrift * Math.cos(progress * Math.PI * 2 + 0.6);
      const squashY = squashBase + squashVar * Math.cos(progress * Math.PI * 2);
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2;
        const r = getVariantRadius(theta, progress);
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta) * squashY;
        pts.push({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
      }
      return pts;
    }

    const pts = variantPoints(Math.min(Math.max(t, 0), 1), 72);
    return catmullRom2bezierPath(pts, 0.58);
  }

  return (
    <div className="overflow-x-hidden" style={{backgroundColor: '#2a2a2a'}}>
      {/* Mobile message - shows on mobile devices */}
      <MobileMessage onMobileDetected={() => setIsMobile(true)} />
      
      {/* Only show content on desktop */}
      {!isMobile && (
        <>
          {/* Loading screen overlay */}
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
          
          {/* Header appears after loading completes */}
          {!isLoading && <Header />}
        </>
      )}

      {/* Main content area with left margin for sidebar - only on desktop */}
      {!isMobile && (
        <div className="ml-20 peer-hover:ml-80 transition-all duration-300">
      {/* Orange background layer behind hero */}
        <div 
          className="w-full bg-brand-orange absolute top-0 left-0 z-0"
          style={{
            height: '100vh',
          }}
        />

      {/* Hero Section */}
        {/* SCROLL text always visible */}
        <div 
          className="absolute bottom-4 text-brand-orange text-2xl font-bold z-10"
          style={{
            left: `calc(20rem - 13rem - ${scrollProgress * 400}px)`,
            transform: 'none'
          }}
        >
          SCROLL TO EXPLORE
        </div>

        {/* Mouse-following circle */}
        <div
          className="fixed pointer-events-none morphing-circle peach-to-red"
          style={{
            zIndex: 2147483645,
            left: circlePosition.x - 100,
            top: circlePosition.y - 100,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 58, 52, 0.7)',
            mixBlendMode: 'exclusion',
            transition: 'none',
            maskImage: 'radial-gradient(circle, transparent 50px, black 50px)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 50px, black 50px)'
          }}
        />
        
        <section 
          ref={heroRef} 
          id="home" 
          className={`w-full hero-outline h-screen relative z-10 ${scrollProgress === 0 ? 'bouncing' : ''}`}
          style={{
            transform: `translateY(${-scrollProgress * 200}px) rotate(${scrollProgress * 90}deg)`,
            transformOrigin: 'right bottom'
          }}
        >
          <div className="hero-corner tl"></div>
          <div className="hero-corner tr"></div>
          <div className="hero-corner bl"></div>
          <div className="hero-corner br"></div>
          <div className="hero-inner h-full flex flex-col justify-center">
            <div className="container mx-auto px-2 lg:px-4">
              {/* Video containers - responsive for MacBook */}
              <div className="flex justify-center gap-8 lg:gap-16 flex-wrap lg:flex-nowrap">
                {/* Left video - full height */}
                <div className="rounded-[24px] lg:rounded-[36px] overflow-hidden h-[400px] lg:h-[600px] xl:h-[700px] 2xl:h-[900px] w-[280px] lg:w-[350px] xl:w-[400px] 2xl:w-[500px] bg-gray-900 flex items-center justify-center relative border-4 border-brand-orange">
                  <video
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                    style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)'}}
                  >
                    <source src="/placeholder.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Center videos - stacked */}
                <div className="flex flex-col gap-8 lg:gap-16 xl:gap-20 2xl:gap-32 h-[400px] lg:h-[600px] xl:h-[700px] 2xl:h-[900px] w-[280px] lg:w-[350px] xl:w-[400px] 2xl:w-[500px]">
                  <div className="rounded-[24px] lg:rounded-[36px] overflow-hidden h-[180px] lg:h-[250px] xl:h-[300px] 2xl:h-[388px] w-full bg-gray-900 flex items-center justify-center relative border-4 border-brand-orange">
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="rounded-[24px] lg:rounded-[36px] overflow-hidden h-[180px] lg:h-[250px] xl:h-[300px] 2xl:h-[388px] w-full bg-gray-900 flex items-center justify-center relative border-4 border-brand-orange">
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                {/* Right video - full height */}
                <div className="rounded-[24px] lg:rounded-[36px] overflow-hidden h-[400px] lg:h-[600px] xl:h-[700px] 2xl:h-[900px] w-[280px] lg:w-[350px] xl:w-[400px] 2xl:w-[500px] bg-gray-900 flex items-center justify-center relative border-4 border-brand-orange">
                  <video
                    className="w-full h-full object-cover"
                    muted
                    autoPlay
                    loop
                    playsInline
                    style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)'}}
                  >
                    <source src="/placeholder.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company name overlay - separate layer for blend effect */}
        <div 
          className="absolute top-1/2 pointer-events-none z-50" 
          style={{
            mixBlendMode: 'difference',
            left: 'calc(50% + 3rem)',
            transform: `translate(-50%, -50%) translateY(${-scrollProgress * 200 - 25}px) rotate(${scrollProgress * 90}deg)`,
            transformOrigin: 'right center'
          }}
        >
            <h1 className="text-[120px] sm:text-[160px] md:text-[200px] lg:text-[240px] xl:text-[280px] 2xl:text-[349px] font-bold leading-[0.95] tracking-[0.05em]" style={{fontFamily: 'Milker', color: '#FFB366'}}>
             RECRUIT
           </h1>
          </div>

        {/* Orange background layer behind circle expansion */}
        <div 
          className="w-full bg-brand-orange absolute z-0"
          style={{
            height: '150vh',
            top: '100vh',
            left: 0,
            opacity: scrollProgress > 0.2 ? 1 : 1
          }}
        />

        {/* Extra orange layer behind circle expansion */}
        <div 
          className="w-full bg-brand-orange absolute z-[-1]"
          style={{
            height: '150vh',
            top: '100vh',
            left: 0,
            opacity: scrollProgress > 0.2 ? 1 : 1
          }}
        />

        {/* Circle Expansion Section */}
         <div 
           className="w-full relative overflow-hidden z-10"
          style={{
            height: '150vh',
            opacity: scrollProgress > 0.2 ? 1 : 1
          }}
        >
          {/* Expanding grey shape - positioned within section */}
          <div 
            className="absolute rounded-full"
            style={{
              width: scrollProgress < 0.75 
                ? `${Math.min(Math.max((scrollProgress - 0.3) * 3 * 800, 50), 1400)}px` // Moderate growth
                : scrollProgress < 0.85
                ? `${Math.min(Math.max(1400 + (scrollProgress - 0.75) * 5 * 800, 1400), 2000)}px` // Final expansion
                : '100%', // Full rectangle at the very end
              height: scrollProgress < 0.75 
                ? `${Math.min(Math.max((scrollProgress - 0.3) * 3 * 800, 50), 1400)}px` // Moderate growth
                : scrollProgress < 0.85
                ? `${Math.min(Math.max(1400 + (scrollProgress - 0.75) * 5 * 800, 1400), 2000)}px` // Final expansion
                : '100%', // Full rectangle at the very end
               backgroundColor: '#2a2a2a', // Grey
              opacity: 1, // Always visible
              transition: 'width 0.3s ease-out, height 0.3s ease-out, border-radius 0.3s ease-out',
              top: '2%', // Position at 2%
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: scrollProgress < 0.85 ? '50%' : '0%', // Keep circle shape longer
              zIndex: 10
            }}
          />
          
          {/* WHAT WE DO text at bottom of circle section */}
          <div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center"
            style={{
              opacity: scrollProgress > 0.85 ? 1 : 0,
              transition: 'opacity 0.8s ease-out'
            }}
          >
            <h2 
              className="text-[100px] sm:text-[120px] md:text-[140px] lg:text-[160px] xl:text-[180px] 2xl:text-[240px] font-bold leading-[0.95] tracking-[0.05em] text-white"
              style={{fontFamily: 'Milker'}}
            >
              WHAT WE DO
            </h2>
          </div>
        </div>

        {/* SVG defs for complex shapes (cloud clips) */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="cloudClip" clipPathUnits="objectBoundingBox">
              <circle cx="0.55" cy="0.40" r="0.28" />
              <circle cx="0.30" cy="0.70" r="0.20" />
              <circle cx="0.80" cy="0.70" r="0.18" />
              <circle cx="0.55" cy="0.75" r="0.24" />
              <circle cx="0.40" cy="0.25" r="0.16" />
              <circle cx="0.70" cy="0.25" r="0.16" />
              <circle cx="0.20" cy="0.50" r="0.12" />
              <circle cx="0.90" cy="0.50" r="0.10" />
              <circle cx="0.45" cy="0.45" r="0.14" />
              <circle cx="0.65" cy="0.45" r="0.14" />
              <circle cx="0.15" cy="0.65" r="0.10" />
              <circle cx="0.85" cy="0.65" r="0.08" />
            </clipPath>
            {/* Variant B - slightly shifted and scaled blobs */}
            <clipPath id="cloudClipB" clipPathUnits="objectBoundingBox">
              <circle cx="0.57" cy="0.42" r="0.27" />
              <circle cx="0.32" cy="0.70" r="0.19" />
              <circle cx="0.78" cy="0.70" r="0.17" />
              <circle cx="0.55" cy="0.77" r="0.23" />
              <circle cx="0.42" cy="0.26" r="0.15" />
              <circle cx="0.68" cy="0.26" r="0.15" />
              <circle cx="0.22" cy="0.49" r="0.11" />
              <circle cx="0.88" cy="0.49" r="0.09" />
              <circle cx="0.46" cy="0.46" r="0.13" />
              <circle cx="0.64" cy="0.46" r="0.13" />
              <circle cx="0.17" cy="0.64" r="0.09" />
              <circle cx="0.83" cy="0.64" r="0.07" />
            </clipPath>
            {/* Variant C - another subtle variation */}
            <clipPath id="cloudClipC" clipPathUnits="objectBoundingBox">
              <circle cx="0.53" cy="0.38" r="0.29" />
              <circle cx="0.28" cy="0.69" r="0.20" />
              <circle cx="0.82" cy="0.69" r="0.18" />
              <circle cx="0.54" cy="0.73" r="0.22" />
              <circle cx="0.39" cy="0.24" r="0.16" />
              <circle cx="0.71" cy="0.24" r="0.16" />
              <circle cx="0.19" cy="0.51" r="0.12" />
              <circle cx="0.91" cy="0.51" r="0.10" />
              <circle cx="0.44" cy="0.44" r="0.15" />
              <circle cx="0.66" cy="0.44" r="0.15" />
              <circle cx="0.13" cy="0.66" r="0.10" />
              <circle cx="0.87" cy="0.66" r="0.08" />
            </clipPath>
          </defs>
        </svg>

        {/* Video Morphing Section - separate from circle expansion */}
          <section ref={videoSectionRef as any} className="w-full relative" style={{backgroundColor: '#2a2a2a', height: '500vh', overflow: 'hidden'}}>
          <div className={`${videoProgress > 0.812 ? 'absolute bottom-32 inset-x-0' : 'fixed inset-0'} flex items-center justify-center z-50`} style={{opacity: videoProgress > 0.02 ? 1 : 0, transition: 'opacity 0.3s ease-out', transform: videoProgress > 0.812 ? 'translateX(-40px)' : 'translateX(0px)'}}>
            <div className="container mx-auto px-6 lg:px-8 flex items-center gap-16">
              {/* Video with morphing shape - single morphing cloud clip-path */}
              <div className="flex-1">
                <div 
                  className="overflow-hidden flex items-center justify-center relative"
                  style={{
                    width: '110%',
                    height: '660px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '0px',
                    transition: 'opacity 0.3s ease-out'
                  }}
                >
                  {/* Inline SVG path clip that morphs with scroll */}
                  <svg className="absolute w-0 h-0">
                    <defs>
                      <clipPath id="cloudMorph" clipPathUnits="objectBoundingBox">
                        <path d={getCloudMorphPath(cloudStageProgress)} />
                      </clipPath>
                      {/* Unique bubble morphs */}
                      <clipPath id="cloudMorphB1" clipPathUnits="objectBoundingBox">
                        <path d={getCloudMorphPathSeeded(cloudStageProgress, 1)} />
                      </clipPath>
                      <clipPath id="cloudMorphB2" clipPathUnits="objectBoundingBox">
                        <path d={getCloudMorphPathSeeded(cloudStageProgress, 2)} />
                      </clipPath>
                      <clipPath id="cloudMorphB3" clipPathUnits="objectBoundingBox">
                        <path d={getCloudMorphPathSeeded(cloudStageProgress, 3)} />
                      </clipPath>
                      <clipPath id="cloudMorphB4" clipPathUnits="objectBoundingBox">
                        <path d={getCloudMorphPathSeeded(cloudStageProgress, 4)} />
                      </clipPath>
                    </defs>
                  </svg>

                  <div className="absolute inset-0" style={{clipPath: 'url(#cloudMorph)', transform: 'scale(1.12)', transformOrigin: 'center'}}>
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)', transform: 'translateX(10px)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Detached bubble clouds (smaller, also morphing) */}
                  <div
                    className="absolute"
                    style={{
                      width: '180px',
                      height: '180px',
                      top: `calc(80px + ${bubble1OffsetY}px)`,
                      left: `calc(30px + ${bubble1OffsetX}px)`,
                      clipPath: 'url(#cloudMorphB1)'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)', transform: 'translateX(10px)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div
                    className="absolute"
                    style={{
                      width: '160px',
                      height: '160px',
                      bottom: `calc(80px + ${bubble2OffsetY}px)`,
                      right: `calc(30px + ${bubble2OffsetX}px)`,
                      clipPath: 'url(#cloudMorphB2)'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)', transform: 'translateX(10px)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Two more separate morphing bubbles with independent motion */}
                  <div
                    className="absolute"
                    style={{
                      width: '140px',
                      height: '140px',
                      top: `calc(120px + ${bubble3OffsetY}px)`,
                      right: `calc(120px + ${bubble3OffsetX}px)`,
                      clipPath: 'url(#cloudMorphB3)'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)', transform: 'translateX(10px)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div
                    className="absolute"
                    style={{
                      width: '120px',
                      height: '120px',
                      bottom: `calc(140px + ${bubble4OffsetY}px)`,
                      left: `calc(140px + ${bubble4OffsetX}px)`,
                      clipPath: 'url(#cloudMorphB4)'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      style={{filter: 'sepia(100%) saturate(250%) hue-rotate(350deg) brightness(0.8)', transform: 'translateX(10px)'}}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* No circle layer per request */}
                </div>
              </div>
              
              {/* Text content */}
              <div className="flex-1">
                <div className="text-center max-w-4xl">
                  <div className="space-y-8 text-left" style={{marginLeft: '40px'}}>
                    <div className="relative h-[350px] sm:h-[400px] md:h-[450px] overflow-hidden">
                      <p 
                        className="absolute text-[42px] sm:text-[56px] md:text-[70px] font-semibold leading-[1] tracking-tight text-white mb-8 transition-all duration-700 ease-in-out"
                        style={{
                          transform: `translateY(${videoProgress < 0.33 ? '0%' : videoProgress < 0.66 ? '-100%' : '-200%'})`,
                          opacity: videoProgress < 0.33 ? 1 : videoProgress < 0.66 ? 0 : 1
                        }}
                      >
                        We work with recruitment companies to show what marketing can do.
                      </p>
                      <p 
                        className="absolute text-[42px] sm:text-[56px] md:text-[70px] font-semibold leading-[1] tracking-tight text-white mb-8 transition-all duration-700 ease-in-out"
                        style={{
                          transform: `translateY(${videoProgress < 0.33 ? '100%' : videoProgress < 0.66 ? '0%' : '-100%'})`,
                          opacity: videoProgress < 0.33 ? 0 : videoProgress < 0.66 ? 1 : 0
                        }}
                      >
                        We help recruitment firms transform their approach through strategic marketing.
                      </p>
                      <p 
                        className="absolute text-[42px] sm:text-[56px] md:text-[70px] font-semibold leading-[1] tracking-tight text-white mb-8 transition-all duration-700 ease-in-out"
                        style={{
                          transform: `translateY(${videoProgress < 0.66 ? '200%' : videoProgress < 1 ? '0%' : '0%'})`,
                          opacity: videoProgress < 0.66 ? 0 : 1
                        }}
                      >
                        We turn recruitment challenges into marketing opportunities that deliver results.
                      </p>
                    </div>
            </div>
          </div>
              </div>
          </div>
        </div>
      </section>

      {/* About Section */}
          <section 
            ref={aboutSectionRef as any}
            id="about" 
            className="bg-brand-orange rounded-t-3xl relative"
            style={{
              height: '100vh',
              zIndex: 999,
              width: `${85 + Math.min(aboutSectionProgress * 30, 15)}%`, 
              margin: '0 auto',
              transform: `translateY(-${aboutSectionProgress * 200}px)`,
              transition: 'width 0.3s ease-out, transform 0.3s ease-out',
              overflow: 'hidden'
            }}
          >
        <div className="container mx-auto px-6 lg:px-8 h-screen flex items-center">
        <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start w-full">
          <div className="lg:w-[230px] flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/c886bf151e8f3d134b02ed15b82ac21a9eb10d80?width=460"
              alt="Team member"
              className="rounded-[15px] w-full h-auto max-w-[230px] mx-auto lg:mx-0"
            />
          </div>

          <div className="flex-1 max-w-4xl">
                      <h2 className="text-[36px] sm:text-[48px] md:text-[60px] font-semibold leading-[1] tracking-tight text-white mb-8">
               We create content that stands out. That sticks. That hits your target audience and gets your brand moving. Fast, powerful and energetic.
            </h2>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold leading-[1.3] tracking-tight text-white mb-8">
               We don't stop at beautiful pictures and fat visuals. We make it measurable. So you know exactly what works and what doesn't. Never again content without strategy. Never again content without result.
              </p>
                      <p className="text-lg sm:text-xl md:text-2xl font-semibold leading-[1.3] tracking-tight text-white mb-8">
               From concept to execution, we deliver content that drives engagement and delivers measurable results for your brand.
              </p>
                    <button className="inline-flex items-center gap-3 px-4 py-3 rounded-[11.25px] border border-white bg-brand-light text-brand-dark font-semibold text-[15px] hover:bg-brand-dark hover:text-brand-light transition-colors">
              Get to know us
              <span className="flex items-center justify-center w-[34px] h-[34px] rounded-[9.38px] bg-brand-dark">
                <ArrowRight className="w-[14px] h-[14px] text-brand-light" />
              </span>
            </button>
          </div>
          </div>
        </div>
      </section>

      {/* Expertise Sections */}
      <section id="expertises" className="bg-brand-orange w-full relative -mt-80 z-10" style={{overflow: 'hidden'}}>
        <div className="w-full pl-0 pr-2.5 space-y-0">
         {/* Section 01 - Social Strategy */}
         <div className="relative h-[65vh]">
             <div className="sticky top-0 z-30 rounded-[50px] bg-brand-red p-12 md:p-16 lg:p-20 relative overflow-hidden h-[700px] w-[90%] max-w-6xl mx-auto mt-80 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl cursor-pointer">
          <div className="flex flex-col lg:flex-row gap-24 lg:gap-40 h-full">
            <div className="flex-1 w-full z-10">
              <span className="inline-block px-6 py-3 rounded-md bg-[#D8EADC] text-brand-dark text-[24px] mb-8">
                Expertise
              </span>
              <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-semibold leading-[0.95] tracking-[-0.05em] text-brand-dark mb-20">
                Social
              </h2>
              <div className="space-y-16">
                <button className="inline-flex items-center gap-4 px-8 py-4 rounded-[15px] bg-[#FA5424] text-white font-semibold text-[18px] hover:opacity-90 transition-opacity">
                  Meer over social strategie
                  <span className="flex items-center justify-center w-[48px] h-[48px] rounded-[12px] bg-brand-red">
                    <ArrowRight className="w-[20px] h-[20px] text-brand-dark" />
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:absolute lg:right-16 lg:top-16">
              <span className="text-[96px] md:text-[128px] lg:text-[150px] xl:text-[170px] font-semibold leading-none text-[#D8EADC]">01</span>
            </div>

            <div className="lg:absolute lg:right-20 lg:bottom-20 transform lg:rotate-[2.5deg] self-center lg:self-auto">
              <div className="w-full max-w-[800px] h-[350px] md:h-[400px] rounded-[36px] bg-[#FA5424] p-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/81ff6d9ad8aa93fee38bcd719e2f2c8833902c79?width=576"
                  alt="Social strategy"
                  className="w-full h-full object-cover rounded-[24px]"
                />
              </div>
            </div>
        </div>
          </div>
        </div>

         {/* Section 02 - Content Creation */}
         <div className="relative h-[300vh]">
             <div className="sticky top-0 z-30 rounded-[50px] bg-brand-pink p-12 md:p-16 lg:p-20 relative overflow-hidden h-[700px] w-[90%] max-w-6xl mx-auto mt-80 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl cursor-pointer">
              <div className="flex flex-col lg:flex-row gap-24 lg:gap-40 h-full">
            <div className="flex-1 w-full z-10">
              <span className="inline-block px-6 py-3 rounded-md bg-brand-red text-brand-dark text-[24px] mb-8">
                Expertise
              </span>
              <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-semibold leading-[0.95] tracking-[-0.05em] text-brand-dark mb-20">
                Content
              </h2>
              <div className="space-y-16">
                <button className="inline-flex items-center gap-4 px-8 py-4 rounded-[15px] bg-brand-red text-brand-dark font-semibold text-[18px] hover:opacity-90 transition-opacity">
                  Meer over content creatie
                  <span className="flex items-center justify-center w-[48px] h-[48px] rounded-[12px] bg-brand-dark">
                    <ArrowRight className="w-[20px] h-[20px] text-brand-red" />
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:absolute lg:right-16 lg:top-16">
              <span className="text-[96px] md:text-[128px] lg:text-[150px] xl:text-[170px] font-semibold leading-none text-[#FDD0FE]">02</span>
            </div>

            <div className="lg:absolute lg:right-20 lg:bottom-20 transform lg:rotate-[2.5deg] self-center lg:self-auto">
              <div className="w-full max-w-[800px] h-[350px] md:h-[400px] rounded-[36px] bg-brand-red p-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/8ea5d10d5ab42503b6cd9dfbbe2d4749d4f9a9a2?width=576"
                  alt="Content creation"
                  className="w-full h-full object-cover rounded-[24px]"
                />
              </div>
              </div>
            </div>
        </div>

         {/* Section 03 - Activation */}
         <div className="relative h-[300vh]">
             <div className="sticky top-0 z-30 rounded-[50px] bg-brand-green p-12 md:p-16 lg:p-20 relative overflow-hidden h-[700px] w-[90%] max-w-6xl mx-auto mt-80 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl cursor-pointer">
              <div className="flex flex-col lg:flex-row gap-24 lg:gap-40 h-full">
            <div className="flex-1 w-full z-10">
              <span className="inline-block px-6 py-3 rounded-md bg-brand-red text-brand-dark text-[24px] mb-8">
                Expertise
              </span>
              <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-semibold leading-[0.95] tracking-[-0.05em] text-brand-dark mb-20">
                Activation
              </h2>
              <div className="space-y-16">
                <button className="inline-flex items-center gap-4 px-8 py-4 rounded-[15px] bg-brand-red text-brand-dark font-semibold text-[18px] hover:opacity-90 transition-opacity">
                  Meer over activatie
                  <span className="flex items-center justify-center w-[48px] h-[48px] rounded-[12px] bg-brand-dark">
                    <ArrowRight className="w-[20px] h-[20px] text-brand-red" />
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:absolute lg:right-16 lg:top-16">
              <span className="text-[96px] md:text-[128px] lg:text-[150px] xl:text-[170px] font-semibold leading-none text-brand-green-light">03</span>
            </div>

            <div className="lg:absolute lg:right-20 lg:bottom-20 transform lg:rotate-[2.5deg] self-center lg:self-auto">
              <div className="w-full max-w-[800px] h-[350px] md:h-[400px] rounded-[36px] bg-brand-red p-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/e2d492953bf3268c94e955201fb6e01200f77c1e?width=576"
                  alt="Activation"
                  className="w-full h-full object-cover rounded-[24px]"
                />
              </div>
              </div>
            </div>
        </div>

         {/* Section 04 - Data */}
         <div className="relative h-[65vh]">
             <div className="sticky top-0 z-30 rounded-[50px] bg-brand-blue p-12 md:p-16 lg:p-20 relative overflow-hidden h-[700px] w-[90%] max-w-6xl mx-auto mt-80 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl cursor-pointer">
              <div className="flex flex-col lg:flex-row gap-24 lg:gap-40 h-full">
            <div className="flex-1 w-full z-10">
              <span className="inline-block px-6 py-3 rounded-md bg-brand-red text-brand-dark text-[24px] mb-8">
                Expertise
              </span>
              <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-semibold leading-[0.95] tracking-[-0.05em] text-brand-dark mb-20">
                Data
              </h2>
              <div className="space-y-16">
                <button className="inline-flex items-center gap-4 px-8 py-4 rounded-[15px] bg-brand-red text-brand-dark font-semibold text-[18px] hover:opacity-90 transition-opacity">
                  Meer over data
                  <span className="flex items-center justify-center w-[48px] h-[48px] rounded-[12px] bg-brand-dark">
                    <ArrowRight className="w-[20px] h-[20px] text-brand-red" />
                  </span>
                </button>
              </div>
            </div>

            <div className="lg:absolute lg:right-16 lg:top-16">
              <span className="text-[96px] md:text-[128px] lg:text-[150px] xl:text-[170px] font-semibold leading-none text-brand-blue-light">04</span>
            </div>

            <div className="lg:absolute lg:right-20 lg:bottom-20 transform lg:rotate-[2.5deg] self-center lg:self-auto">
              <div className="w-full max-w-[800px] h-[350px] md:h-[400px] rounded-[36px] bg-brand-red p-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/b44516bf1376d623e1a6115ed8b1b98fe527d0e7?width=576"
                  alt="Data insights"
                  className="w-full h-full object-cover rounded-[24px]"
                />
              </div>
              </div>
            </div>
        </div>
          </div>
        </div>
        </div>
        </div>
      </section>



      {/* CTA Section */}
      <section id="contact" className="bg-brand-orange w-full relative py-32">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center max-w-6xl mx-auto">
            <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-bold leading-[0.95] tracking-[0.02em] text-brand-dark mb-16" style={{fontFamily: 'Milker'}}>
              Let's Work Together!
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
              <button className="group flex items-center gap-6 px-12 py-6 rounded-[25px] border-2 border-brand-dark bg-brand-light text-brand-dark font-bold text-[24px] hover:bg-brand-dark hover:text-brand-light transition-all duration-500 hover:scale-105 hover:shadow-2xl w-full lg:w-auto" style={{fontFamily: 'Milker'}}>
                Mail ons direct
                <span className="flex items-center justify-center w-[60px] h-[60px] rounded-[15px] bg-brand-dark group-hover:bg-brand-light transition-colors duration-500">
                  <Mail className="w-6 h-6 text-brand-light group-hover:text-brand-dark transition-colors duration-500" />
                </span>
              </button>
              <button className="group flex items-center gap-6 px-12 py-6 rounded-[25px] bg-brand-red text-brand-dark font-bold text-[24px] hover:bg-brand-light hover:scale-105 hover:shadow-2xl transition-all duration-500 w-full lg:w-auto" style={{fontFamily: 'Milker'}}>
                Get Results
                <span className="flex items-center justify-center w-[60px] h-[60px] rounded-[15px] bg-brand-dark group-hover:bg-brand-red transition-colors duration-500">
                  <svg className="w-6 h-6 text-brand-light group-hover:text-brand-dark transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[64px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-[0.02em] text-brand-light mb-8" style={{fontFamily: 'Milker'}}>
              RECRUIT
            </h2>
            <p className="text-[24px] md:text-[28px] font-semibold text-brand-light/80" style={{fontFamily: 'Milker'}}>
              Let's create something amazing together
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="text-center md:text-left">
              <h3 className="text-brand-light font-bold text-[24px] mb-6" style={{fontFamily: 'Milker'}}>Follow us</h3>
              <div className="flex gap-4 justify-center md:justify-start">
                {['LinkedIn', 'TikTok', 'Instagram', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center hover:bg-brand-light hover:scale-110 transition-all duration-300"
                    aria-label={social}
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 bg-brand-light rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-brand-light font-bold text-[24px] mb-6" style={{fontFamily: 'Milker'}}>Contact</h3>
              <div className="space-y-3">
                <p className="text-[18px] text-brand-light font-semibold">your-email@domain.com</p>
                <p className="text-[18px] text-brand-light font-semibold">+1 234 567 8900</p>
              </div>
            </div>

            <div className="text-center md:text-left">
              <h3 className="text-brand-light font-bold text-[24px] mb-6" style={{fontFamily: 'Milker'}}>Address</h3>
              <p className="text-[18px] text-brand-light font-semibold">
                Your Street Address,<br />
                City, State ZIP
              </p>
            </div>

            <div className="text-center md:text-left space-y-3">
              <a href="#expertises" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Expertises</a>
              <a href="#about" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>About</a>
              <a href="#contact" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Contact</a>
            </div>
          </div>
          
          <div className="pt-8 border-t border-brand-light/20 text-center">
            <a href="#" className="text-[16px] text-brand-light/60 font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
        </div>
      )}
    </div>
  );
}
