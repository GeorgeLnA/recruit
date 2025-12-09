import { ArrowRight, Mail, Linkedin, Phone, MapPin, Volume2, VolumeX, ArrowDown } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import MobileMessage from "@/components/MobileMessage";
import { FlipButton } from "@/components/FlipButton";
import Footer from "@/components/Footer";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

// SVG file names from /public/svgs
const svgFiles = [
  'ppe-gloves.svg',
  'ppe-goggles.svg',
  'mobile-clinic.svg',
  'ppe-mask.svg',
  'bandage-adhesive.svg',
  'medicines.svg',
  'infusion-pump.svg',
  'cell-nuclei.svg',
  'dna.svg',
  'blood-drop.svg',
];

export default function Index() {
  const heroRef = useRef<HTMLElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const expertiseSectionRef = useRef<HTMLElement>(null);
  const expertiseCardRefs = useRef<(HTMLElement | null)[]>([null, null, null, null]);
  const lastScrollYRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [aboutSectionProgress, setAboutSectionProgress] = useState(0);
  const [expertiseSectionProgress, setExpertiseSectionProgress] = useState(0);
  const [expertiseCardProgress, setExpertiseCardProgress] = useState<number[]>([0, 0, 0, 0]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroVideoContainerRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

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


  // Set video thumbnail to 0.1 seconds
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      video.currentTime = 0.1;
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // If metadata is already loaded, set it immediately
    if (video.readyState >= 1) {
      video.currentTime = 0.1;
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Start video playback just before loading is complete
  useEffect(() => {
    if (isLoading && heroVideoRef.current) {
      // Start video 0.4 seconds before loading completes
      // Loading takes: 3 morphs (3.6s) + 1s hold = 4.6s, exit = 1s, total ~5.6s
      // Start at ~5.2s (0.4s before completion)
      const startVideoTimeout = setTimeout(() => {
        if (heroVideoRef.current && isLoading) {
          heroVideoRef.current.play().catch((error) => {
            console.log('Video autoplay prevented:', error);
          });
        }
      }, 5200); // 5.2 seconds

      return () => clearTimeout(startVideoTimeout);
    } else if (!isLoading && heroVideoRef.current) {
      // Fallback: if loading already finished, start immediately
      heroVideoRef.current.play().catch((error) => {
        console.log('Video autoplay prevented:', error);
      });
    }
  }, [isLoading]);

  // Hero video sound enable and custom cursor
  useEffect(() => {
    const container = heroVideoContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const damping = 0.8; // Smoothing factor (higher = more delay/smoother)

    const animate = () => {
      // Smooth interpolation with damping
      currentX += (targetX - currentX) * (1 - damping);
      currentY += (targetY - currentY) * (1 - damping);
      
      setCursorPosition({ x: currentX, y: currentY });
      
      // Continue animation if there's still movement
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const handleMouseEnter = () => {
      setIsHoveringHero(true);
    };

    const handleMouseLeave = () => {
      setIsHoveringHero(false);
    };

    const handleClick = () => {
      if (heroVideoRef.current) {
        heroVideoRef.current.muted = !heroVideoRef.current.muted;
        setIsSoundEnabled(!heroVideoRef.current.muted);
      }
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
    };
  }, []);

  // Scroll animation for About Us word reveal
  useEffect(() => {
    const storySegments = [
      "At CDC Global Solutions, we're all about people – not just filling roles.",
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
      
      // Delay the start of animation - add offset to delay when words start revealing
      const startDelay = scrollDistance * 0.15; // Delay start by 15% of scroll distance
      const adjustedAnimationStart = animationStart + startDelay;
      
      // Spread word reveal over more scroll distance for smoother word-by-word effect
      let progress = (currentScroll - adjustedAnimationStart) / (scrollDistance * 0.8);
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

  // Arrow hover animations
  useEffect(() => {
    const arrowClient = document.querySelector('.arrow-client');
    const arrowCandidate = document.querySelector('.arrow-candidate');
    const containerClient = document.querySelector('.arrow-container-client');
    const containerCandidate = document.querySelector('.arrow-container-candidate');

    if (!arrowClient || !arrowCandidate || !containerClient || !containerCandidate) return;

    // Client arrow animation
    const handleClientEnter = () => {
      gsap.to(arrowClient, {
        y: 10,
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleClientLeave = () => {
      gsap.to(arrowClient, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Candidate arrow animation
    const handleCandidateEnter = () => {
      gsap.to(arrowCandidate, {
        y: 10,
        scale: 1.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleCandidateLeave = () => {
      gsap.to(arrowCandidate, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    containerClient.addEventListener('mouseenter', handleClientEnter);
    containerClient.addEventListener('mouseleave', handleClientLeave);
    containerCandidate.addEventListener('mouseenter', handleCandidateEnter);
    containerCandidate.addEventListener('mouseleave', handleCandidateLeave);

    return () => {
      containerClient.removeEventListener('mouseenter', handleClientEnter);
      containerClient.removeEventListener('mouseleave', handleClientLeave);
      containerCandidate.removeEventListener('mouseenter', handleCandidateEnter);
      containerCandidate.removeEventListener('mouseleave', handleCandidateLeave);
    };
  }, []);

  return (
    <div className="overflow-x-hidden bg-white relative">
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
          <div 
            ref={heroVideoContainerRef}
            className="hero-inner h-full flex flex-col justify-center relative"
            style={{ 
              overflow: 'visible',
              margin: 0,
              padding: 0,
              border: 'none'
            }}
          >
            {/* Video background */}
            <video
              ref={heroVideoRef}
              className="absolute w-full object-cover pointer-events-none"
              style={{
                top: '63px', // Start exactly at bottom of header offset
                left: 0,
                right: 0,
                bottom: 0, // Extend to bottom of viewport, filling remaining height
                border: 'none',
                borderRadius: 0,
                outline: 'none',
                boxShadow: 'none'
              }}
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              disableRemotePlayback
            >
              <source
                src="/vids/Hero.webm"
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>

            {/* Custom sound cursor */}
            {isHoveringHero && (
              <div
                className="fixed pointer-events-none z-50 flex flex-col items-center gap-2"
                style={{
                  left: `${cursorPosition.x + 20}px`,
                  top: `${cursorPosition.y}px`,
                  transform: 'translateY(-50%)',
                  willChange: 'transform'
                }}
              >
                {isSoundEnabled ? (
                  <VolumeX 
                    className="w-10 h-10 text-white"
                  />
                ) : (
                  <Volume2 
                    className="w-10 h-10 text-white"
                  />
                )}
                <div
                  className="px-3 py-1.5 rounded-lg bg-white shadow-lg whitespace-nowrap"
                  style={{
                    fontFamily: 'TexGyreAdventor',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'var(--color-blue)'
                  }}
                >
                  {isSoundEnabled ? 'Click to mute' : 'Click for sound'}
                </div>
              </div>
            )}

            {/* Work with us button */}
            <div 
              className="absolute left-1/2 z-40"
              style={{
                bottom: 'clamp(120px, 15vw, 180px)',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '1400px'
              }}
            >
              <div className="flex items-center justify-center w-full">
                <FlipButton
                  href="/work-with-us#client"
                  frontText="Work with us"
                  backText="Work with us"
                  from="top"
                  className="pointer-events-auto"
                  frontClassName="bg-[var(--color-blue)] text-white font-bold text-xl rounded-lg"
                  backClassName="bg-[var(--color-peach)] text-[var(--color-blue)] font-bold text-xl rounded-lg"
                  style={{ paddingLeft: '48px', paddingRight: '48px', paddingTop: '24px', paddingBottom: '24px' }}
                />
              </div>
            </div>

            {/* Text with blend effect */}
          <div 
              className="absolute left-1/2 z-40"
          style={{
            bottom: 'clamp(16px, 5vw, 120px)',
            transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '1400px'
              }}
            >
              <div
                className="flex items-center justify-center w-full px-6 py-3 md:px-8 md:py-4"
              >
                <div 
                  className="flex flex-wrap items-center justify-center font-bold leading-none tracking-wide pointer-events-none"
                  style={{ 
                    fontFamily: 'TexGyreAdventor',
                    color: 'var(--color-blue)',
                    fontSize: 'clamp(20px, 2.5vw, 48px)',
                    textAlign: 'center',
                    gap: '0.6em'
                  }}
                >
                  <span>CDMO</span>
                  <span className="text-[var(--color-peach)]" aria-hidden="true">
                    &bull;
                  </span>
                  <span>Diagnostics</span>
                  <span className="text-[var(--color-peach)]" aria-hidden="true">
                    &bull;
                  </span>
                  <span>CRO</span>
                </div>
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
            className="absolute rounded-full relative"
            style={{
              backgroundColor: 'var(--color-peach)',
              filter: 'none',
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
          </div>
          
        </div>

      {/* About Us */}
          <section 
        ref={aboutUsRef as any}
        className="w-full relative bg-brand-orange"
        style={{ paddingTop: '120px', paddingBottom: '60px' }}
      >
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[48px] sm:text-[56px] md:text-[64px] font-bold leading-[0.95] tracking-[0.05em] text-[var(--color-white)] text-center mb-24">About Us</h2>
            
            {(() => {
              const storySegments = [
                "At CDC Global Solutions, we're all about people – not just filling roles.",
                "We've spent years building trusted relationships and networks within the pharmaceutical and biotech worlds, which means we know how to find the right people for the right roles."
              ];

              const allWords = storySegments.flatMap(segment => segment.split(' '));
              let wordIndex = 0;

              return (
              <div className="space-y-32">
                  {storySegments.map((segment, segmentIndex) => {
                    const segmentWords = segment.split(' ');
                    const segmentStartIndex = wordIndex;
                    wordIndex += segmentWords.length;
                    
                    return (
                      <p
                        key={segmentIndex}
                        className={`text-4xl md:text-5xl lg:text-6xl leading-tight text-[var(--color-white)] ${segmentIndex === 1 ? 'text-right' : ''}`}
                        style={{
                          fontWeight: 600
                        }}
                      >
                        {segmentWords.map((word, i) => {
                          const currentWordIndex = segmentStartIndex + i;
                          const isRevealed = currentWordIndex < revealedWordCount;
                          return (
                            <span
                              key={i}
                              className={isRevealed ? 'text-[var(--color-white)]' : 'text-[var(--color-white)]/40'}
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
      <section className="w-full relative bg-brand-orange py-24 overflow-visible">
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[48px] sm:text-[56px] md:text-[64px] font-bold leading-[0.95] tracking-[0.05em] text-[var(--color-white)] text-center mb-16">Meet Our Founders</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              {/* Harriet */}
              <div className="group relative cursor-pointer">
                <div className="rounded-2xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden" style={{ border: '3px solid #FF9752' }}>
                    <img 
                      src="/optimised/Harriet Headshot 8.jpg" 
                      alt="Harriet" 
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                />
              </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-white)] mb-2">Harriet Wheat</h3>
                  <p className="text-[var(--color-white)]/90 text-lg md:text-xl font-semibold">Co-Founder</p>
                  <p className="text-[var(--color-white)]/80 text-base md:text-lg mt-3">CDMO/CRO Recruitment</p>
                  <p className="text-[var(--color-white)]/70 text-sm md:text-base mt-4 max-w-md mx-auto leading-relaxed">
                    With over a decade of experience in pharmaceutical recruitment, Harriet brings deep industry knowledge and a passion for connecting top talent with leading organizations. Her expertise spans across CDMO and CRO sectors, helping companies build exceptional teams.
                  </p>
            </div>
        </div>

              {/* Adam */}
              <div className="group relative cursor-pointer">
                <div className="rounded-2xl shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden" style={{ border: '3px solid #FF9752' }}>
                    <img 
                      src="/optimised/Adam Headshot 4.jpg" 
                      alt="Adam" 
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                />
              </div>
                <div className="mt-6 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-white)] mb-2">Adam Hargreaves</h3>
                  <p className="text-[var(--color-white)]/90 text-lg md:text-xl font-semibold">Co-Founder</p>
                  <p className="text-[var(--color-white)]/80 text-base md:text-lg mt-3">Diagnostics Recruitment</p>
                  <p className="text-[var(--color-white)]/70 text-sm md:text-base mt-4 max-w-md mx-auto leading-relaxed">
                    Adam specializes in diagnostics recruitment, bringing years of experience in identifying and placing exceptional professionals. His strategic approach and extensive network help candidates find their ideal roles and companies discover the perfect talent.
                  </p>
        </div>
          </div>
        </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="bg-brand-orange w-full relative py-32 overflow-visible">
        <div className="container mx-auto px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
          <div className="text-center max-w-6xl mx-auto">
            <h2 className="text-[48px] md:text-[64px] lg:text-[80px] xl:text-[96px] font-bold leading-[0.95] tracking-[0.02em] text-[var(--color-white)] mb-16">
              Choose Your Path
            </h2>
            
            {/* Arrows and Buttons Container */}
            <div className="flex justify-center items-start gap-16 max-w-5xl mx-auto">
              {/* Left Arrow and Client Button */}
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="arrow-container-client"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowDown 
                    className="arrow-client text-[var(--color-white)]"
                    style={{ 
                      width: '48px', 
                      height: '48px',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
                <FlipButton
                  href="/work-with-us#client"
                  frontText="Client"
                  backText="Client"
                  from="top"
                  className="px-16 py-6 rounded-[25px] font-bold text-[32px]"
                  frontClassName="bg-[var(--color-blue)] text-white rounded-[25px]"
                  backClassName="bg-[var(--color-white)] text-[var(--color-blue)] rounded-[25px]"
                />
              </div>

              {/* Right Arrow and Candidate Button */}
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="arrow-container-candidate"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowDown 
                    className="arrow-candidate text-[var(--color-white)]"
                    style={{ 
                      width: '48px', 
                      height: '48px',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
                <FlipButton
                  href="/work-with-us#candidate"
                  frontText="Candidate"
                  backText="Candidate"
                  from="top"
                  className="px-16 py-6 rounded-[25px] font-bold text-[32px]"
                  frontClassName="bg-[var(--color-white)] text-[var(--color-blue)] rounded-[25px]"
                  backClassName="bg-[var(--color-blue)] text-white rounded-[25px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
          </div>
        </>
      )}
    </div>
  );
}
