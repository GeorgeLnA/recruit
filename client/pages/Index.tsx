import { ArrowRight, Mail, Linkedin, Instagram, Youtube, Phone, MapPin } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MobileMessage from "@/components/MobileMessage";
import { useEffect, useRef, useState } from "react";

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const watchVideoSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const expertiseSectionRef = useRef<HTMLElement>(null);
  const expertiseCardRefs = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const lastScrollYRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [watchVideoProgress, setWatchVideoProgress] = useState(0);
  const [aboutSectionProgress, setAboutSectionProgress] = useState(0);
  const [expertiseSectionProgress, setExpertiseSectionProgress] = useState(0);
  const [expertiseCardProgress, setExpertiseCardProgress] = useState<number[]>([0, 0, 0, 0]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const marketInsightsVideoRef = useRef<HTMLVideoElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [revealedWordCount, setRevealedWordCount] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
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

          // Compute local progress for the watch video section (0..1 within that section)
          if (watchVideoSectionRef.current) {
            const sectionTop = watchVideoSectionRef.current.offsetTop;
            const sectionHeight = watchVideoSectionRef.current.offsetHeight || 1;
            const windowHeight = window.innerHeight;
            // Start animation much earlier - well before section enters viewport
            const startOffset = windowHeight * 0.5; // Positive offset to start earlier
            const scrollRange = sectionHeight * 0.4; // Animation happens quickly over 40% of section
            const local = Math.min(Math.max((scrollY - sectionTop + startOffset) / scrollRange, 0), 1);
            setWatchVideoProgress(local);
          }

          // Compute local progress for the about section (0..1 within that section)
          if (aboutSectionRef.current) {
            const sectionTop = aboutSectionRef.current.offsetTop;
            const sectionHeight = aboutSectionRef.current.offsetHeight || 1;
            const local = Math.min(Math.max((scrollY - sectionTop) / sectionHeight, 0), 1);
            setAboutSectionProgress(local);
          }

          // Compute local progress for the expertise section (0..1 within that section)
          if (expertiseSectionRef.current) {
            const sectionTop = expertiseSectionRef.current.offsetTop;
            const sectionHeight = expertiseSectionRef.current.offsetHeight || 1;
            const local = Math.min(Math.max((scrollY - sectionTop) / sectionHeight, 0), 1);
            setExpertiseSectionProgress(local);
          }

          // Compute continuous per-card progress (0..1) based on distance past viewport center
          const windowHeight = window.innerHeight || 1;
          const isScrollingUp = scrollY < lastScrollYRef.current;
          const viewportCenter = windowHeight / 2;
          const targetProgress: number[] = [0, 0, 0, 0];

          expertiseCardRefs.current.forEach((cardRef, index) => {
            if (!cardRef) return;
            const rect = cardRef.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            // Positive when card center is above viewport center
            let distance = viewportCenter - cardCenter;
            // Return earlier when scrolling up (bias by ~25% viewport height)
            const returnBiasPx = windowHeight * 0.25;
            if (isScrollingUp) {
              distance -= returnBiasPx;
            }
            // Map distance to 0..1; slightly tighter when scrolling up so it returns earlier
            const mappingDenom = windowHeight * (isScrollingUp ? 0.45 : 0.5);
            const raw = distance / mappingDenom;
            const clamped = Math.min(Math.max(raw, 0), 1);
            // Ease out for nicer start and end motion
            const eased = clamped * (2 - clamped);
            targetProgress[index] = eased;
          });

          // Smoothly approach target progress; much snappier when scrolling up
          const approach = isScrollingUp ? 0.65 : 0.35;
          setExpertiseCardProgress(prev => prev.map((p, i) => p + (targetProgress[i] - p) * approach));

          // Update last scroll position
          lastScrollYRef.current = scrollY;

          rafId = null; // Reset to allow next frame
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Removed IntersectionObserver in favor of a simpler, stable rAF-based tracker

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

  // Smoothly raise the fixed video container up near the end of the section (avoid jump)
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const raiseUpProgress = Math.min(Math.max((videoProgress - 0.8) / 0.2, 0), 1); // starts at 80%, ends at 100%
  const raiseUpY = raiseUpProgress * viewportHeight; // move up to one full viewport height

  // Text morphing based on video progress (3 different messages)
  const getMorphingText = (progress: number) => {
    if (progress < 0.33) {
      return "We help recruitment firms transform their approach through strategic marketing.";
    } else if (progress < 0.66) {
      return "We turn recruitment challenges into marketing opportunities that deliver results.";
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

  // Transform helper for expertise cards (stable, progress-based)
  function getCardTransform(direction: 'left' | 'right', progress: number) {
    const dir = direction === 'left' ? -1 : 1;
    const dx = dir * progress * 120; // vw
    const dy = -80 * progress; // px
    const rot = dir * 20 * progress; // deg
    const scale = 1 - 0.4 * progress;
    return `translateX(${dx}vw) translateY(${dy}px) rotate(${rot}deg) scale(${scale})`;
  }

  // Scroll-reveal animations for the videos section
  useEffect(() => {
    const elements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.style.opacity = '1';
            el.style.transform = 'translate(0, 0)';
            if (!el.style.transition) {
              el.style.transition = 'opacity 700ms ease, transform 700ms ease';
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Footer unreveal animation
  useEffect(() => {
    if (!footerRef.current) return;

    const footer = footerRef.current;
    const columns = footer.querySelectorAll('[data-footer-col]');
    const bottomBar = footer.querySelector('[data-footer-bottom]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate columns with staggered delay
            columns.forEach((col, index) => {
              setTimeout(() => {
                (col as HTMLElement).style.opacity = '1';
                (col as HTMLElement).style.transform = 'translateY(0)';
              }, index * 100);
            });

            // Animate bottom bar after columns
            setTimeout(() => {
              if (bottomBar) {
                (bottomBar as HTMLElement).style.opacity = '1';
                (bottomBar as HTMLElement).style.transform = 'translateY(0)';
              }
            }, columns.length * 100 + 200);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // Ensure Market Insights video plays when visible
  useEffect(() => {
    if (!marketInsightsVideoRef.current) return;

    const video = marketInsightsVideoRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((err) => {
              console.log('Video autoplay prevented:', err);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.unobserve(video);
  }, []);

  // Scroll animation for About Us word reveal
  useEffect(() => {
    const storySegments = [
      "At CDC Global Solutions Ltd, we're all about people – not just filling roles.",
      "We've spent years building trusted relationships and networks within the pharmaceutical and biotech worlds, which means we know how to find the right people for the right roles."
    ];
    const allWords = storySegments.flatMap(segment => segment.split(' '));
    const totalWords = allWords.length;

    let rafId: number | null = null;
    let targetProgress = 0;
    let currentProgress = 0;

    const smoothScroll = () => {
      const difference = targetProgress - currentProgress;
      currentProgress += difference * 0.15; // Slower interpolation for smoother word-by-word reveal
      
      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        const wordsToReveal = Math.floor(currentProgress * totalWords);
        setRevealedWordCount(wordsToReveal);
        rafId = requestAnimationFrame(smoothScroll);
      } else {
        setRevealedWordCount(Math.floor(targetProgress * totalWords));
      }
    };

    const handleScroll = () => {
      if (!aboutUsRef.current) return;

      const container = aboutUsRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const eyeLevel = windowHeight * 0.62;
      
      const animationStart = rect.top + window.scrollY - eyeLevel;
      const animationEnd = rect.top + window.scrollY + rect.height - eyeLevel;
      const scrollDistance = animationEnd - animationStart;
      const currentScroll = window.scrollY;
      
      // Spread word reveal over more scroll distance for smoother word-by-word effect
      let progress = (currentScroll - animationStart) / (scrollDistance * 0.8);
      targetProgress = Math.max(0, Math.min(1, progress));
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(smoothScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="overflow-x-hidden bg-white relative">
      {/* Grain effect overlay for main background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.35]"
        style={{
          zIndex: 1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          mixBlendMode: 'overlay'
        }}
      ></div>
      {/* Mobile message - shows on mobile devices */}
      <MobileMessage onMobileDetected={() => setIsMobile(true)} />
      
      {/* Only show content on desktop */}
      {!isMobile && (
        <>
          {/* Loading screen overlay */}
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
          
          {/* Main content area - only on desktop */}
          <div>

      {/* Hero Section */}
        <section 
          ref={heroRef} 
          id="home" 
          className={`w-full hero-outline h-screen relative z-10 ${scrollProgress === 0 ? 'bouncing' : ''}`}
          style={{
            transform: `translateY(${-scrollProgress * 200}px) rotate(${scrollProgress * 90}deg)`,
            transformOrigin: 'right bottom'
          }}
        >
          <div className="hero-corner bl"></div>
          <div className="hero-corner br"></div>
          <div className="hero-inner h-full flex flex-col justify-center relative overflow-hidden">
            {/* Video background */}
            <video
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src="/placeholder.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Text with blend effect */}
        <div 
              className="absolute top-1/2 left-1/2 z-40"
          style={{
            mixBlendMode: 'difference',
            transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '1400px'
              }}
            >
              <div className="text-center space-y-4 w-full">
                <div 
                  className="font-bold leading-none tracking-wide pointer-events-none"
                  style={{ 
                    fontFamily: 'Milker', 
                    color: '#FFFFFF',
                    fontSize: 'clamp(44px, 5.5vw, 108px)',
                    letterSpacing: '0.05em'
                  }}
                >
                  Executive Search
                </div>
                <div 
                  className="font-bold leading-none tracking-wide pointer-events-none"
                  style={{ 
                    fontFamily: 'Milker', 
                    color: '#FFFFFF',
                    fontSize: 'clamp(44px, 5.5vw, 108px)',
                    letterSpacing: '0.05em'
                  }}
                >
                  Market Insights
                </div>
                <div 
                  className="font-bold leading-none tracking-wide pointer-events-none"
                  style={{ 
                    fontFamily: 'Milker', 
                    color: '#FFFFFF',
                    fontSize: 'clamp(44px, 5.5vw, 108px)',
                    letterSpacing: '0.05em'
                  }}
                >
                  Project Work
                </div>
              </div>
          </div>
            
            {/* CTA Button - separate container without blend effect */}
            <div 
              className="absolute top-1/2 left-1/2 z-40 pointer-events-auto"
              style={{
                transform: 'translate(-50%, calc(-50% + clamp(120px, 18vw, 260px)))',
                width: '90%',
                maxWidth: '1400px'
              }}
            >
              <div className="text-center">
                <a
                  href="/work-with-us"
                  className="inline-block px-8 py-4 font-bold tracking-wide transition-all duration-300 hover:scale-105"
                  style={{
                    fontFamily: 'Milker',
                    backgroundColor: '#FF3A34',
                    color: '#FFFFFF',
                    fontSize: 'clamp(18px, 1.5vw, 24px)',
                    borderRadius: '8px'
                  }}
                >
                  WORK WITH US
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Circle Expansion Section */}
         <div 
           className="w-full relative overflow-hidden z-10"
          style={{
            height: scrollProgress >= 0.85 ? '100vh' : '200vh',
            opacity: scrollProgress > 0.2 ? 1 : 1,
            transition: scrollProgress >= 0.85 ? 'height 0.3s ease-out' : 'none'
          }}
        >
          {/* Expanding shape - positioned within section */}
          <div 
            className="absolute rounded-full relative bg-brand-orange"
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
              opacity: 1, // Always visible
              transition: 'border-radius 0.1s linear', // Only transition border-radius, much faster
              top: '2%', // Position at 2%
              left: '50%',
              transform: 'translateX(-50%)',
              borderRadius: scrollProgress < 0.85 ? '50%' : '0%', // Keep circle shape longer
              zIndex: 10,
              willChange: 'width, height, border-radius' // Optimize for performance
            }}
          >
            {/* Grain effect overlay for expanding circle */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.25]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px',
                mixBlendMode: 'overlay',
                borderRadius: 'inherit'
              }}
            />
          </div>
          
        </div>

      {/* Video Section under WHAT WE DO */}
      <section 
        ref={watchVideoSectionRef as any}
        className="w-full relative bg-brand-orange flex flex-col items-center justify-center"
            style={{
          minHeight: '100vh',
          paddingTop: 0,
          paddingBottom: '160px',
          marginTop: '-80px' // Move section higher, closer to section above
        }}
      >
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
          style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply'
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center gap-12" style={{ paddingTop: 0 }}>
          {/* Heading */}
          <h2 
            className="text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-[0.05em] text-white text-center mb-2"
            style={{fontFamily: 'Milker', marginTop: 0, paddingTop: 0}}
          >
            Watch Our Story
            </h2>
          <div 
            className="relative w-full max-w-7xl rounded-lg overflow-hidden shadow-2xl"
                  style={{
              height: watchVideoProgress > 0 
                ? `${2 + watchVideoProgress * 650}px`
                : '2px',
              transition: 'none',
              willChange: 'height'
            }}
          >
                    <video
              id="main-video"
                      className="w-full h-full object-cover"
              preload="metadata"
              style={{ 
                backgroundColor: '#000',
                width: '100%',
                height: '650px',
                display: 'block'
              }}
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
            {/* Play button overlay */}
            <div 
              id="play-button-overlay"
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-300"
              style={{
                opacity: watchVideoProgress > 0.5 ? 1 : watchVideoProgress * 2
              }}
              onClick={() => {
                const video = document.getElementById('main-video') as HTMLVideoElement;
                const overlay = document.getElementById('play-button-overlay');
                if (video && overlay) {
                  video.play();
                  video.controls = true;
                  overlay.style.display = 'none';
                }
              }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white bg-opacity-90 flex items-center justify-center hover:bg-opacity-100 transition-all duration-300 hover:scale-110">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                  </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section with Peach Background */}
      <section 
        className="w-full relative"
        style={{
          backgroundColor: '#FF914D',
          paddingTop: '96px',
          paddingBottom: '64px',
          paddingLeft: '48px',
          paddingRight: '48px',
          minHeight: '100vh'
        }}
      >
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
                    style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply'
          }}
        />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col gap-12 lg:gap-16">
            {/* Item 1 */}
            <div className="relative flex flex-col lg:flex-row items-center gap-4 lg:gap-12 lg:mt-0">
              <div 
                className="w-full relative overflow-hidden rounded-lg shadow-2xl"
                data-animate
                style={{
                  aspectRatio: '9/16',
                  backgroundColor: '#000',
                  width: 'clamp(220px, 22vw, 360px)',
                  maxWidth: '360px',
                  opacity: 0,
                  transform: 'translateX(-40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                  muted
                      loop
                      playsInline
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div
                className="text-white space-y-4 max-w-2xl"
                data-animate
                    style={{
                  opacity: 0,
                  transform: 'translateX(40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                }}
              >
                <h3 className="text-4xl lg:text-5xl xl:text-6xl font-bold" style={{fontFamily: 'Milker'}}>
                  Executive Search Excellence
                </h3>
              </div>
                  </div>

            {/* Item 2 */}
            <div className="relative flex flex-col lg:flex-row-reverse items-center gap-4 lg:gap-12 lg:mt-12">
                  <div
                className="w-full relative overflow-hidden rounded-lg shadow-2xl"
                data-animate
                    style={{
                  aspectRatio: '9/16',
                  backgroundColor: '#000',
                  width: 'clamp(220px, 22vw, 360px)',
                  maxWidth: '360px',
                  opacity: 0,
                  transform: 'translateX(40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                    }}
                  >
                    <video
                  ref={marketInsightsVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                  muted
                      loop
                      playsInline
                  preload="auto"
                    >
                  <source src="/video2.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
              </div>
              <div
                className="text-white space-y-4 max-w-2xl"
                data-animate
                style={{
                  opacity: 0,
                  transform: 'translateX(-40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                }}
              >
                <h3 className="text-4xl lg:text-5xl xl:text-6xl font-bold" style={{fontFamily: 'Milker'}}>
                  Market Insights That Matter
                </h3>
              </div>
                  </div>

            {/* Item 3 */}
            <div className="relative flex flex-col lg:flex-row items-center gap-4 lg:gap-12 lg:mt-8">
                  <div
                className="w-full relative overflow-hidden rounded-lg shadow-2xl"
                data-animate
                    style={{
                  aspectRatio: '9/16',
                  backgroundColor: '#000',
                  width: 'clamp(220px, 22vw, 360px)',
                  maxWidth: '360px',
                  opacity: 0,
                  transform: 'translateX(-40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                    }}
                  >
                    <video
                      className="w-full h-full object-cover"
                      autoPlay
                  muted
                      loop
                      playsInline
                    >
                      <source src="/placeholder.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
              <div
                className="text-white space-y-4 max-w-2xl"
                data-animate
                        style={{
                  opacity: 0,
                  transform: 'translateX(40px)',
                  transition: 'opacity 700ms ease, transform 700ms ease'
                }}
              >
                <h3 className="text-4xl lg:text-5xl xl:text-6xl font-bold" style={{fontFamily: 'Milker'}}>
                  Project Work Delivered
                </h3>
          </div>
              </div>
          </div>
        </div>
      </section>

      {/* About Us */}
          <section 
        ref={aboutUsRef as any}
        className="w-full relative bg-brand-orange"
        style={{ minHeight: '150vh', paddingTop: '120px', paddingBottom: '120px' }}
      >
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
            style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply'
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="max-w-5xl mx-auto space-y-16">
            <h2 className="text-[48px] sm:text-[56px] md:text-[64px] font-bold leading-[0.95] tracking-[0.05em] text-white text-center" style={{ fontFamily: 'Milker' }}>About Us</h2>
            
            {(() => {
              const storySegments = [
                "At CDC Global Solutions Ltd, we're all about people – not just filling roles.",
                "We've spent years building trusted relationships and networks within the pharmaceutical and biotech worlds, which means we know how to find the right people for the right roles."
              ];

              const allWords = storySegments.flatMap(segment => segment.split(' '));
              let wordIndex = 0;

              return (
              <div className="space-y-16">
                  {storySegments.map((segment, segmentIndex) => {
                    const segmentWords = segment.split(' ');
                    const segmentStartIndex = wordIndex;
                    wordIndex += segmentWords.length;
                    
                    return (
                      <p
                        key={segmentIndex}
                        className="text-4xl md:text-5xl lg:text-6xl leading-tight text-white"
                        style={{
                          fontFamily: 'Milker',
                          fontWeight: 600,
                          letterSpacing: '0.02em'
                        }}
                      >
                        {segmentWords.map((word, i) => {
                          const currentWordIndex = segmentStartIndex + i;
                          const isRevealed = currentWordIndex < revealedWordCount;
                          return (
                            <span
                              key={i}
                              className={isRevealed ? 'text-white' : 'text-white/40'}
                              style={{
                                transition: 'all 0.3s ease-out',
                                opacity: isRevealed ? 1 : 0.4
                              }}
                            >
                              {word}{' '}
              </span>
                          );
                        })}
                      </p>
                    );
                  })}
              </div>
              );
            })()}
            </div>
            </div>
      </section>

      {/* Meet Our Founders */}
      <section className="w-full relative bg-brand-orange py-24">
        {/* Grain effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
          style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply'
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[48px] sm:text-[56px] md:text-[64px] font-bold leading-[0.95] tracking-[0.05em] text-white text-center mb-16" style={{ fontFamily: 'Milker' }}>Meet Our Founders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {/* Harriet */}
              <div className="group relative cursor-pointer">
                <div className="bg-white rounded-2xl p-1 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <img 
                      src="/Harriet Headshot 8.jpg" 
                      alt="Harriet" 
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                />
              </div>
              </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Milker' }}>Harriet</h3>
                  <p className="text-white/90 text-lg md:text-xl font-semibold">Strategy & Brand</p>
                  <p className="text-white/80 text-base md:text-lg mt-3">Leads strategy and brand development, ensuring every campaign is built on insight and purpose.</p>
            </div>
        </div>

              {/* Adam */}
              <div className="group relative cursor-pointer">
                <div className="bg-white rounded-2xl p-1 shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <img 
                      src="/Adam Headshot 4.jpg" 
                      alt="Adam" 
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                />
              </div>
              </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Milker' }}>Adam</h3>
                  <p className="text-white/90 text-lg md:text-xl font-semibold">Creative & Production</p>
                  <p className="text-white/80 text-base md:text-lg mt-3">Drives creative and production, turning strategy into bold, impactful work that moves brands forward.</p>
        </div>
          </div>
        </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="bg-brand-orange w-full relative py-32">
        {/* Grain effect for contact section */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply',
            zIndex: 1
          }}
        />
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="text-center max-w-6xl mx-auto">
            <h2 className="text-[72px] md:text-[96px] lg:text-[120px] xl:text-[140px] font-bold leading-[0.95] tracking-[0.02em] text-white mb-16" style={{fontFamily: 'Milker'}}>
              Let's Work Together!
            </h2>
            
            <div className="flex justify-center items-center max-w-4xl mx-auto">
              <button className="px-16 py-6 rounded-[25px] bg-brand-red text-white font-bold text-[32px] hover:opacity-90 hover:scale-105 hover:shadow-2xl transition-all duration-500" style={{fontFamily: 'Milker'}}>
                YES!
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef as any} className="bg-brand-dark py-20 lg:py-32 relative">
        {/* Grain Effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.22]"
          style={{
            zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '150px 150px',
            mixBlendMode: 'multiply'
          }}
        />
        
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            {/* Brand Column */}
            <div 
              data-footer-col
              className="text-center md:text-left"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out'
              }}
            >
              <h2 className="text-[48px] md:text-[56px] lg:text-[64px] font-bold leading-[0.95] tracking-[0.02em] text-brand-light mb-4" style={{fontFamily: 'Milker'}}>
              CDC
            </h2>
              <p className="text-[18px] md:text-[20px] text-brand-light/70 mb-8" style={{fontFamily: 'Milker', letterSpacing: '0.05em'}}>
                Global Solutions Ltd
            </p>
              <div className="flex gap-4 justify-center md:justify-start">
                  <a
                    href="#"
                  className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-brand-red/90 flex items-center justify-center hover:bg-brand-red hover:scale-110 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Contact Column */}
            <div 
              data-footer-col
              className="text-center md:text-left"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out'
              }}
            >
              <h3 className="text-brand-light font-bold text-[20px] mb-6" style={{fontFamily: 'Milker', letterSpacing: '0.05em'}}>Contact</h3>
              <div className="space-y-4">
                <a href="mailto:info@cdcglobalsolutions.com" className="flex items-center gap-3 text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors group justify-center md:justify-start">
                  <Mail className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>info@cdcglobalsolutions.com</span>
                </a>
                <a href="tel:+12345678900" className="flex items-center gap-3 text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors group justify-center md:justify-start">
                  <Phone className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+1 234 567 8900</span>
                </a>
              </div>
            </div>

            {/* Address Column */}
            <div 
              data-footer-col
              className="text-center md:text-left"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out'
              }}
            >
              <h3 className="text-brand-light font-bold text-[20px] mb-6" style={{fontFamily: 'Milker', letterSpacing: '0.05em'}}>Location</h3>
              <div className="flex items-start gap-3 text-[16px] md:text-[18px] text-brand-light/80 justify-center md:justify-start">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <p>123 Business Street</p>
                  <p>City, State 12345</p>
                  <p>United Kingdom</p>
                </div>
              </div>
            </div>

            {/* Navigation Column */}
            <div 
              data-footer-col
              className="text-center md:text-left"
              style={{
                opacity: 0,
                transform: 'translateY(40px)',
                transition: 'opacity 800ms ease-out, transform 800ms ease-out'
              }}
            >
              <h3 className="text-brand-light font-bold text-[20px] mb-6" style={{fontFamily: 'Milker', letterSpacing: '0.05em'}}>Quick Links</h3>
              <div className="space-y-3">
                <a href="#expertises" className="block text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Expertises</a>
                <a href="#about" className="block text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>About</a>
                <a href="/work-with-us" className="block text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Work With Us</a>
                <a href="#contact" className="block text-[16px] md:text-[18px] text-brand-light/80 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Contact</a>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div 
            data-footer-bottom
            className="pt-8 border-t border-brand-light/10"
            style={{
              opacity: 0,
              transform: 'translateY(30px)',
              transition: 'opacity 800ms ease-out, transform 800ms ease-out'
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[14px] text-brand-light/60 text-center md:text-left" style={{fontFamily: 'Milker'}}>
                © {new Date().getFullYear()} CDC Global Solutions Ltd. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-[14px] text-brand-light/60 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>
              Privacy Policy
            </a>
                <a href="#" className="text-[14px] text-brand-light/60 hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>
                  Terms of Service
            </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
          </div>
        </>
      )}
    </div>
  );
}
