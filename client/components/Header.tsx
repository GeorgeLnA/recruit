import { ArrowRight, Menu, X, ChevronDown, Linkedin } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { FlipButton } from "@/components/FlipButton";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  label: string;
  href: string;
  submenu?: Array<{ label: string; href: string }>;
}

interface HeaderProps {
  logoSrc?: string;
  items?: NavItem[];
  cta?: { label: string; href: string };
  sticky?: boolean;
  className?: string;
}

export default function Header({ 
  logoSrc, 
  items = [
    { label: "Expertises", href: "#expertises" },
    { label: "Work", href: "#work" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ], 
  cta,
  sticky = true,
  className = ""
}: HeaderProps) {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [animatingOutLabel, setAnimatingOutLabel] = useState<string | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expandBg1Ref = useRef<HTMLDivElement>(null);
  const expandBg2Ref = useRef<HTMLDivElement>(null);
  const expandBg3Ref = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  const mobileNavItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Check if screen is MacBook-sized or smaller (1440px and below)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 1440);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile menu slide-in animation with GSAP
  useEffect(() => {
    if (!mobileMenuRef.current || !mobileOverlayRef.current) return;

    if (isMenuOpen) {
      // Animate menu in
      gsap.set(mobileMenuRef.current, { x: '100%', display: 'block' });
      gsap.set(mobileOverlayRef.current, { opacity: 0, display: 'block' });
      
      // Set menu items to visible initially (in case animation doesn't run)
      const validRefs = mobileNavItemsRef.current.filter(ref => ref !== null);
      if (validRefs.length > 0) {
        gsap.set(validRefs, { opacity: 1, x: 0 });
      }
      
      const tl = gsap.timeline();
      
      // Overlay fade in
      tl.to(mobileOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Menu slide in
      tl.to(mobileMenuRef.current, {
        x: '0%',
        duration: 0.5,
        ease: 'power3.out'
      }, '-=0.2');
      
      // Stagger menu items - only if refs exist
      if (validRefs.length > 0) {
        gsap.set(validRefs, { opacity: 0, x: 50 });
        tl.to(validRefs, {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out'
        }, '-=0.3');
      }
    } else {
      // Animate menu out
      const tl = gsap.timeline();
      const validRefs = mobileNavItemsRef.current.filter(ref => ref !== null);
      
      // Stagger menu items out
      if (validRefs.length > 0) {
        tl.to(validRefs, {
          x: 50,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: 'power2.in'
        });
      }
      
      // Menu slide out
      tl.to(mobileMenuRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in'
      }, '-=0.2');
      
      // Overlay fade out
      tl.to(mobileOverlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set([mobileMenuRef.current, mobileOverlayRef.current], { display: 'none' });
          // Reset menu items position for next open
          if (validRefs.length > 0) {
            gsap.set(validRefs, { opacity: 1, x: 0 });
          }
        }
      }, '-=0.2');
    }
  }, [isMenuOpen]);

  // Helper function to handle dropdown with delay for smooth transitions
  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if ((label === 'Work With Us' || label === 'Proof in the People') && isAnimatingOut) {
      setIsAnimatingOut(false);
      setAnimatingOutLabel(null);
      // Kill any ongoing GSAP animations and reset position immediately
      const dropdownEl = dropdownRefs.current.get(label);
      if (dropdownEl) {
        gsap.killTweensOf(dropdownEl);
        gsap.set(dropdownEl, { x: 0 });
        const innerPanel = dropdownEl.querySelector('div') as HTMLElement;
        if (innerPanel) {
          gsap.killTweensOf(innerPanel);
          gsap.set(innerPanel, { scaleX: 1, transformOrigin: 'left center' });
        }
      }
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = (label: string) => {
    if (label === 'Work With Us' || label === 'Proof in the People') {
      // Small delay before starting exit animation to allow moving to panel
      dropdownTimeoutRef.current = setTimeout(() => {
        setAnimatingOutLabel(label);
        setIsAnimatingOut(true);
        // Then wait for animation to complete before closing
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimatingOut(false);
          setAnimatingOutLabel(null);
          setActiveDropdown(null);
        }, 750); // Match animation duration (700ms) + small buffer
      }, 150); // Initial delay to allow moving between button and panel
    } else {
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 150); // Small delay to allow moving to panel
    }
  };

  // Animate dropdown morphing from button - skip on mobile
  useEffect(() => {
    if (isMobile) return; // Skip dropdown animations on mobile
    
    items.forEach((item) => {
      if (!item.submenu) return;
      
      const dropdownEl = dropdownRefs.current.get(item.label);
      const buttonEl = buttonRefs.current.get(item.label);
      
      if (!dropdownEl || !buttonEl) return;
      
      if (activeDropdown === item.label) {
        // Special handling for "Work With Us" and "Proof in the People" mega panels - slide from left
        if (item.label === 'Work With Us' || item.label === 'Proof in the People') {
          // Force a reflow to get final dimensions
          dropdownEl.style.visibility = 'hidden';
          dropdownEl.style.display = 'block';
          const dropdownRect = dropdownEl.getBoundingClientRect();
          dropdownEl.style.visibility = '';
          dropdownEl.style.display = '';
          
          const targetWidth = dropdownRect.width;
          const targetHeight = dropdownRect.height;
          
          // Start from left edge, extending smoothly to the right
          const innerPanel = dropdownEl.querySelector('div') as HTMLElement;
          
          // Set initial hidden state - pure slide, no opacity
          gsap.set(dropdownEl, { 
            x: -targetWidth,
            transformOrigin: 'left center'
          });
          
          // Animate to visible - pure slide animation
          gsap.to(dropdownEl, {
            x: 0,
            duration: 0.7,
            ease: 'power3.out'
          });
          
          if (innerPanel) {
            gsap.set(innerPanel, {
              scaleX: 0,
              transformOrigin: 'left center'
            });
            
            gsap.to(innerPanel, {
              scaleX: 1,
              duration: 0.7,
              ease: 'power3.out'
            });
          }
          return;
        }
        
        // Regular dropdown - morph from button
        const buttonRect = buttonEl.getBoundingClientRect();
        
        // Force a reflow to get final dimensions
        dropdownEl.style.visibility = 'hidden';
        dropdownEl.style.display = 'block';
        const dropdownRect = dropdownEl.getBoundingClientRect();
        dropdownEl.style.visibility = '';
        dropdownEl.style.display = '';
        
        const targetHeight = dropdownRect.height;
        const targetWidth = dropdownRect.width || 256;
        
        // Set initial state - morph from button
        gsap.fromTo(dropdownEl, {
          y: -(buttonRect.height + 8),
          width: buttonRect.width,
          height: buttonRect.height,
          borderRadius: '8px',
          opacity: 0,
          scale: 0.95,
          transformOrigin: 'top center'
        }, {
          y: 0,
          width: targetWidth,
          height: targetHeight,
          borderRadius: '12px',
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(dropdownEl, { height: 'auto' });
          }
        });
      } else {
        // Animate out (skip Work With Us and Proof in the People - handled separately)
        if (item.label !== 'Work With Us' && item.label !== 'Proof in the People') {
          // Regular dropdown animate out
          gsap.to(dropdownEl, {
            opacity: 0,
            scale: 0.95,
            y: -10,
            duration: 0.2,
            ease: 'power2.in'
          });
        }
        // Note: Work With Us and Proof in the People exit animation is handled
        // separately in the isAnimatingOut effect, so we don't interfere here
      }
    });
  }, [activeDropdown, items, isMobile]);

  // Handle exit animation for Work With Us and Proof in the People panels - skip on mobile
  useEffect(() => {
    if (isMobile) return; // Skip exit animations on mobile
    if (!isAnimatingOut || !animatingOutLabel) return;
    
    const dropdownEl = dropdownRefs.current.get(animatingOutLabel);
    if (!dropdownEl) return;
    
    const dropdownRect = dropdownEl.getBoundingClientRect();
    const innerPanel = dropdownEl.querySelector('div') as HTMLElement;
    
    // Pure slide to right for mega panel exit - no opacity fade
    gsap.to(dropdownEl, {
      x: window.innerWidth,
      duration: 0.7,
      ease: 'power3.in',
      onComplete: () => {
        // Reset position off-screen to the left for next slide-in
        const targetWidth = dropdownRect.width;
        gsap.set(dropdownEl, { x: -targetWidth });
        if (innerPanel) {
          gsap.set(innerPanel, { scaleX: 0, transformOrigin: 'left center' });
        }
      }
    });
    
    if (innerPanel) {
      gsap.to(innerPanel, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.7,
        ease: 'power3.in'
      });
    }
  }, [isAnimatingOut, animatingOutLabel, isMobile]);

  // Set extended state (used for smaller screens on mount/resize)
  const setExtendedState = () => {
    if (!expandBg1Ref.current || !expandBg2Ref.current || !expandBg3Ref.current || 
        !logoRef.current || !navRef.current || !ctaRef.current || !headerContainerRef.current) {
      return;
    }

    const headerRect = headerContainerRef.current.getBoundingClientRect();
    
    // Get positions of all 3 islands
    const logoRect = logoRef.current.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const ctaRect = ctaRef.current.getBoundingClientRect();

    const logo = {
      left: logoRect.left - headerRect.left,
      top: logoRect.top - headerRect.top,
      width: logoRect.width,
      height: logoRect.height
    };
    const nav = {
      left: navRect.left - headerRect.left,
      top: navRect.top - headerRect.top,
      width: navRect.width,
      height: navRect.height
    };
    const cta = {
      left: ctaRect.left - headerRect.left,
      top: ctaRect.top - headerRect.top,
      width: ctaRect.width,
      height: ctaRect.height
    };

    // Kill any ongoing animations
    gsap.killTweensOf([expandBg1Ref.current, expandBg2Ref.current, expandBg3Ref.current]);

    // Set extended state immediately (no animation)
    if (expandBg1Ref.current && expandBg2Ref.current && expandBg3Ref.current) {
      gsap.set(expandBg1Ref.current, {
        left: 0,
        top: logo.top + logo.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        opacity: 1
      });
      gsap.set(expandBg2Ref.current, {
        left: 0,
        top: nav.top + nav.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        opacity: 1
      });
      gsap.set(expandBg3Ref.current, {
        left: 0,
        top: cta.top + cta.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        opacity: 1
      });
    }
  };

  const handleHeaderHover = () => {
    // Skip hover animation on smaller screens - they're already extended
    if (isSmallScreen) {
      return;
    }

    if (!expandBg1Ref.current || !expandBg2Ref.current || !expandBg3Ref.current || 
        !logoRef.current || !navRef.current || !ctaRef.current || !headerContainerRef.current) {
      return;
    }

    const headerRect = headerContainerRef.current.getBoundingClientRect();
    
    // Get positions of all 3 islands
    const logoRect = logoRef.current.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const ctaRect = ctaRef.current.getBoundingClientRect();

    const logo = {
      left: logoRect.left - headerRect.left,
      top: logoRect.top - headerRect.top,
      width: logoRect.width,
      height: logoRect.height
    };
    const nav = {
      left: navRect.left - headerRect.left,
      top: navRect.top - headerRect.top,
      width: navRect.width,
      height: navRect.height
    };
    const cta = {
      left: ctaRect.left - headerRect.left,
      top: ctaRect.top - headerRect.top,
      width: ctaRect.width,
      height: ctaRect.height
    };

    // Kill any ongoing animations
    gsap.killTweensOf([expandBg1Ref.current, expandBg2Ref.current, expandBg3Ref.current]);

    // Liquid fill effect - all 3 expand simultaneously with smooth ease
    const duration = 1.2;
    const ease = 'power1.inOut';

    // Island 1 (Logo) - expands from left
    gsap.timeline()
      .set(expandBg1Ref.current, {
        left: logo.left,
        top: logo.top + logo.height - window.innerHeight * 2,
        width: logo.width,
        height: window.innerHeight * 2,
        opacity: 1,
        borderRadius: '12px'
      })
      .to(expandBg1Ref.current, {
        left: 0,
        top: logo.top + logo.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        duration: duration,
        ease: ease
      });

    // Island 2 (Nav) - expands from center
    gsap.timeline()
      .set(expandBg2Ref.current, {
        left: nav.left,
        top: nav.top + nav.height - window.innerHeight * 2,
        width: nav.width,
        height: window.innerHeight * 2,
        opacity: 1,
        borderRadius: '12px'
      })
      .to(expandBg2Ref.current, {
        left: 0,
        top: nav.top + nav.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        duration: duration,
        ease: ease,
        delay: 0.05
      });

    // Island 3 (CTA) - expands from right
    gsap.timeline()
      .set(expandBg3Ref.current, {
        left: cta.left,
        top: cta.top + cta.height - window.innerHeight * 2,
        width: cta.width,
        height: window.innerHeight * 2,
        opacity: 1,
        borderRadius: '12px'
      })
      .to(expandBg3Ref.current, {
        left: 0,
        top: cta.top + cta.height - window.innerHeight * 2,
        width: '100%',
        height: window.innerHeight * 2,
        borderRadius: '0px',
        duration: duration,
        ease: ease,
        delay: 0.1
      });
  };

  const handleHeaderLeave = () => {
    // Skip leave animation on smaller screens - keep them extended
    if (isSmallScreen) {
      return;
    }

    if (!expandBg1Ref.current || !expandBg2Ref.current || !expandBg3Ref.current ||
        !logoRef.current || !navRef.current || !ctaRef.current || !headerContainerRef.current) {
      return;
    }

    const headerRect = headerContainerRef.current.getBoundingClientRect();
    
    // Get current positions
    const logoRect = logoRef.current.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const ctaRect = ctaRef.current.getBoundingClientRect();

    const logo = {
      left: logoRect.left - headerRect.left,
      top: logoRect.top - headerRect.top,
      width: logoRect.width,
      height: logoRect.height
    };
    const nav = {
      left: navRect.left - headerRect.left,
      top: navRect.top - headerRect.top,
      width: navRect.width,
      height: navRect.height
    };
    const cta = {
      left: ctaRect.left - headerRect.left,
      top: ctaRect.top - headerRect.top,
      width: ctaRect.width,
      height: ctaRect.height
    };

    // Kill any ongoing animations
    gsap.killTweensOf([expandBg1Ref.current, expandBg2Ref.current, expandBg3Ref.current]);

    const duration = 0.8;
    const ease = 'power2.inOut';

    // Morph back to islands and fade
    gsap.timeline()
      .to(expandBg1Ref.current, {
        left: logo.left,
        top: logo.top + logo.height - window.innerHeight * 2,
        width: logo.width,
        height: window.innerHeight * 2,
        borderRadius: '12px',
        duration: duration,
        ease: ease
      })
      .to(expandBg1Ref.current, {
        opacity: 0,
        duration: 0.3
      });

    gsap.timeline()
      .to(expandBg2Ref.current, {
        left: nav.left,
        top: nav.top + nav.height - window.innerHeight * 2,
        width: nav.width,
        height: window.innerHeight * 2,
        borderRadius: '12px',
        duration: duration,
        ease: ease,
        delay: 0.05
      })
      .to(expandBg2Ref.current, {
        opacity: 0,
        duration: 0.3
      });

    gsap.timeline()
      .to(expandBg3Ref.current, {
        left: cta.left,
        top: cta.top + cta.height - window.innerHeight * 2,
        width: cta.width,
        height: window.innerHeight * 2,
        borderRadius: '12px',
        duration: duration,
        ease: ease,
        delay: 0.1
      })
      .to(expandBg3Ref.current, {
        opacity: 0,
        duration: 0.3
      });
  };

  // Set extended state on mount/resize for smaller screens
  useEffect(() => {
    if (isSmallScreen) {
      // Small delay to ensure refs are ready
      const timeoutId = setTimeout(() => {
        setExtendedState();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      // Reset to collapsed state on larger screens
      if (expandBg1Ref.current && expandBg2Ref.current && expandBg3Ref.current) {
        gsap.set([expandBg1Ref.current, expandBg2Ref.current, expandBg3Ref.current], {
          opacity: 0
        });
      }
    }
  }, [isSmallScreen]);

  return (
    <>
      {/* Simple square with circular cutout - positioned dynamically, higher on smaller screens */}
      {/* Header height = top padding + island height + bottom padding = clamp(4px, 0.5vw, 8px) + clamp(50px, 4vw, 65px) + clamp(10px, 1.25vw, 20px) = clamp(64px, 5.75vw, 93px) */}
      {/* Position higher on MacBook (1440px) and smaller screens, hide on screens smaller than 1624px */}
      <style>{`
        @media (max-width: 1440px) {
          .header-corner-left,
          .header-corner-right {
            top: clamp(35px, 3.5vw, 50px) !important;
          }
        }
        @media (max-width: 1624px) {
          .header-corner-left,
          .header-corner-right {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .global-border-frame,
          .global-border-corner {
            display: none !important;
          }
        }
      `}</style>
      <div 
        className="header-corner-left"
        style={{ 
          '--corner-size': 'clamp(15px, 1.25vw, 20px)',
          '--corner-width': 'clamp(30px, 2.5vw, 40px)',
          position: 'fixed',
          top: 'clamp(54px, 5.5vw, 63px)',
          left: 'clamp(6px, 0.75vw, 12px)',
          zIndex: 2147483649,
          width: 'var(--corner-width)',
          height: 'var(--corner-width)',
          backgroundColor: 'var(--theme-background)',
          mask: `radial-gradient(circle at center, transparent var(--corner-size), white var(--corner-size))`,
          WebkitMask: `radial-gradient(circle at center, transparent var(--corner-size), white var(--corner-size))`,
          clipPath: `polygon(0 0, var(--corner-size) 0, var(--corner-size) var(--corner-size), 0 var(--corner-size))`,
          WebkitClipPath: `polygon(0 0, var(--corner-size) 0, var(--corner-size) var(--corner-size), 0 var(--corner-size))`,
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        } as React.CSSProperties & { '--corner-size': string; '--corner-width': string }}
      />
      
      {/* Mirrored square with circular cutout - positioned dynamically, higher on smaller screens */}
      <div 
        className="header-corner-right"
        style={{ 
          '--corner-size': 'clamp(15px, 1.25vw, 20px)',
          '--corner-width': 'clamp(30px, 2.5vw, 40px)',
          position: 'fixed',
          top: 'clamp(54px, 5.5vw, 63px)',
          right: 'clamp(6px, 0.75vw, 12px)',
          zIndex: 2147483649,
          width: 'var(--corner-width)',
          height: 'var(--corner-width)',
          backgroundColor: 'var(--theme-background)',
          mask: `radial-gradient(circle at center, transparent var(--corner-size), white var(--corner-size))`,
          WebkitMask: `radial-gradient(circle at center, transparent var(--corner-size), white var(--corner-size))`,
          clipPath: `polygon(var(--corner-size) 0, var(--corner-width) 0, var(--corner-width) var(--corner-size), var(--corner-size) var(--corner-size))`,
          WebkitClipPath: `polygon(var(--corner-size) 0, var(--corner-width) 0, var(--corner-width) var(--corner-size), var(--corner-size) var(--corner-size))`,
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        } as React.CSSProperties & { '--corner-size': string; '--corner-width': string }}
      />
      
      {/* Frame stuck to viewport with rounded corners - hidden on mobile */}
      <div 
        className="global-border-frame fixed inset-0 pointer-events-none hidden md:block"
        style={{ 
          zIndex: 2147483647,
          borderLeft: '13px solid var(--theme-background)',
          borderRight: '13px solid var(--theme-background)',
          borderBottom: '13px solid var(--theme-background)',
          borderTop: 'none',
          borderRadius: '24px'
        }}
      />
      {/* Triangle corners - hidden on mobile */}
      <div 
        className="global-border-corner fixed top-0 left-0 pointer-events-none hidden md:block"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderTop: '13px solid var(--theme-background)',
          borderLeft: '13px solid var(--theme-background)',
          borderRight: '13px solid transparent',
          borderBottom: '13px solid transparent'
        }}
      />
      <div 
        className="global-border-corner fixed top-0 right-0 pointer-events-none hidden md:block"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderTop: '13px solid var(--theme-background)',
          borderRight: '13px solid var(--theme-background)',
          borderLeft: '13px solid transparent',
          borderBottom: '13px solid transparent'
        }}
      />
      <div 
        className="global-border-corner fixed bottom-0 left-0 pointer-events-none hidden md:block"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderBottom: '13px solid var(--theme-background)',
          borderLeft: '13px solid var(--theme-background)',
          borderRight: '13px solid transparent',
          borderTop: '13px solid transparent'
        }}
      />
      <div 
        className="global-border-corner fixed bottom-0 right-0 pointer-events-none hidden md:block"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderBottom: '13px solid var(--theme-background)',
          borderRight: '13px solid var(--theme-background)',
          borderLeft: '13px solid transparent',
          borderTop: '13px solid transparent'
        }}
      />
      
      <style>{`
        @media (max-width: 767px) {
          .mobile-header-bg {
            background-color: var(--theme-background) !important;
          }
        }
      `}</style>
      <header 
        className={`fixed top-0 left-0 right-0 pointer-events-auto mobile-header-bg ${className}`}
        style={{ 
          zIndex: 2147483646, 
          fontFamily: 'TexGyreAdventor'
        }}
        role="banner"
        aria-label="Main navigation"
        onMouseEnter={handleHeaderHover}
        onMouseLeave={handleHeaderLeave}
      >
        <div className={`relative transition-all duration-300 md:bg-transparent`}>
        {/* Three expanding background layers for liquid fill effect */}
        <div 
          ref={expandBg1Ref}
          className="absolute pointer-events-none"
          style={{
            backgroundColor: 'var(--theme-background)',
            opacity: 0,
            zIndex: 3,
            mixBlendMode: 'normal'
          }}
        />
        <div 
          ref={expandBg2Ref}
          className="absolute pointer-events-none"
          style={{
            backgroundColor: 'var(--theme-background)',
            opacity: 0,
            zIndex: 4,
            mixBlendMode: 'normal'
          }}
        />
        <div 
          ref={expandBg3Ref}
          className="absolute pointer-events-none"
          style={{
            backgroundColor: 'var(--theme-background)',
            opacity: 0,
            zIndex: 5,
            mixBlendMode: 'normal'
          }}
        />
        
        <div 
          ref={headerContainerRef}
          className="flex items-center justify-between w-full relative z-10 pointer-events-auto"
          style={{ paddingLeft: 'clamp(12px, 1.5vw, 24px)', paddingRight: 'clamp(12px, 1.5vw, 24px)', paddingTop: 'clamp(4px, 0.5vw, 8px)', paddingBottom: 'clamp(10px, 1.25vw, 20px)' }}
        >
          {/* Mobile Header - Simple: Logo Center, Menu Button Right */}
          <div className="md:hidden flex items-center w-full relative" style={{ justifyContent: 'space-between' }}>
            {/* Spacer for balance - same width as menu button to center logo */}
            <div style={{ width: 'clamp(40px, 4vw, 52px)', flexShrink: 0 }}></div>
            
            {/* Logo/Name - Center */}
            <a href="/" className="group/logo flex items-center justify-center relative overflow-hidden rounded-lg transition-all duration-300 flex-1" style={{ paddingLeft: 'clamp(8px, 1vw, 12px)', paddingRight: 'clamp(8px, 1vw, 12px)', paddingTop: 'clamp(5px, 0.625vw, 8px)', paddingBottom: 'clamp(5px, 0.625vw, 8px)', textAlign: 'center' }}>
              <div className="absolute opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: 'var(--theme-accent)', top: '4px', bottom: '4px', left: '4px', right: '4px'}}></div>
              <div className="relative z-10 text-white whitespace-nowrap flex items-center justify-center" style={{ fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', textAlign: 'center' }}>
                CDC Global Solutions
              </div>
            </a>
            
            {/* Menu Button - Right */}
            <button
              className="text-white hover:bg-white/20 rounded-lg transition-colors duration-200 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              style={{ padding: 'clamp(8px, 1vw, 12px)' }}
            >
              {isMenuOpen ? <X className="flex-shrink-0" style={{ width: 'clamp(24px, 2vw, 28px)', height: 'clamp(24px, 2vw, 28px)' }} /> : <Menu className="flex-shrink-0" style={{ width: 'clamp(24px, 2vw, 28px)', height: 'clamp(24px, 2vw, 28px)' }} />}
            </button>
          </div>

          {/* Desktop Header - Keep existing islands */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Island 1: Logo */}
            <div 
              ref={logoRef as React.RefObject<HTMLDivElement>}
              className="glass-island glass-island-logo transition-all duration-300 ease-out cursor-default pointer-events-auto relative"
              style={{ zIndex: 30, marginTop: '-10px', height: 'clamp(50px, 4vw, 65px)', minHeight: 'clamp(50px, 4vw, 65px)', maxHeight: 'clamp(50px, 4vw, 65px)', backgroundColor: 'var(--color-peach)' }}
            >
              <div className="glass-island-inner flex items-center h-full" style={{ padding: 'clamp(8px, 1vw, 16px)', backgroundColor: 'var(--color-peach)' }}>
                <a href="/" className="group/logo flex items-center relative overflow-hidden rounded-lg transition-all duration-300" style={{ paddingLeft: 'clamp(8px, 1vw, 16px)', paddingRight: 'clamp(8px, 1vw, 16px)', paddingTop: 'clamp(5px, 0.625vw, 10px)', paddingBottom: 'clamp(5px, 0.625vw, 10px)' }}>
                  <div className="absolute opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: 'var(--theme-accent)', top: '4px', bottom: '4px', left: '4px', right: '4px'}}></div>
                  <div className="relative z-10 text-white whitespace-nowrap flex items-center" style={{ fontSize: 'clamp(14px, 1.5vw, 24px)', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', marginLeft: 'clamp(-4px, -0.5vw, -8px)' }}>
                    CDC Global Solutions
                  </div>
                </a>
              </div>
            </div>

            {/* Island 2: Navigation */}
            <nav 
              ref={navRef}
              className="glass-island flex items-center transition-all duration-300 ease-out cursor-default pointer-events-auto relative"
              style={{ zIndex: 30, marginTop: '-10px', height: 'clamp(50px, 4vw, 65px)', minHeight: 'clamp(50px, 4vw, 65px)', maxHeight: 'clamp(50px, 4vw, 65px)', backgroundColor: 'var(--color-peach)' }}
            >
              <div className="glass-island-inner h-full flex items-center" style={{ padding: 'clamp(8px, 1vw, 16px)', backgroundColor: 'var(--color-peach)' }}>
                <div className="flex items-center flex-nowrap" style={{ gap: 'clamp(8px, 1.25vw, 20px)', flexWrap: 'nowrap' }}>
                  {items.map((item, index) => (
                    item.submenu ? (
                      <div
                        key={index}
                        className="relative group/nav flex-shrink-0"
                        onMouseEnter={() => {
                          if (item.label === 'Work With Us' || item.label === 'Proof in the People') {
                            handleDropdownEnter(item.label);
                          } else {
                            setActiveDropdown(item.label);
                          }
                        }}
                        onMouseLeave={() => {
                          if (item.label === 'Work With Us' || item.label === 'Proof in the People') {
                            handleDropdownLeave(item.label);
                          } else {
                            setActiveDropdown(null);
                          }
                        }}
                      >
                        <button 
                          ref={(el) => {
                            if (el) buttonRefs.current.set(item.label, el);
                          }}
                          className="flex items-center font-bold text-white relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                          style={{ gap: 'clamp(4px, 0.5vw, 8px)', paddingLeft: 'clamp(8px, 1vw, 16px)', paddingRight: 'clamp(8px, 1vw, 16px)', paddingTop: 'clamp(5px, 0.625vw, 10px)', paddingBottom: 'clamp(5px, 0.625vw, 10px)', fontSize: 'clamp(10px, 1vw, 16px)' }}
                          onClick={() => {
                            if (item.label === 'Work With Us') {
                              window.location.href = '/work-with-us#client';
                            } else if (item.label === 'Proof in the People') {
                              window.location.href = '/proof-in-the-people#testimonials';
                            }
                          }}
                        >
                          <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: 'var(--theme-accent)'}}></div>
                          <div className="relative z-10 flex items-center" style={{ gap: 'clamp(4px, 0.5vw, 8px)' }}>
                            <span className="font-bold group-hover/nav:text-white transition-colors" style={{ lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(10px, 1vw, 16px)' }}>{item.label}</span>
                            <ChevronDown className="text-white group-hover/nav:text-white transition-all duration-300 flex-shrink-0" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
                          </div>
                        </button>
                        {item.label !== 'Work With Us' && item.label !== 'Proof in the People' && activeDropdown === item.label && (
                          <div 
                            ref={(el) => {
                              if (el) dropdownRefs.current.set(item.label, el);
                            }}
                            className="absolute top-full left-0 mt-2 bg-[var(--color-peach)] rounded-xl shadow-2xl border py-2 z-50"
                            style={{ borderColor: 'var(--theme-background)', width: 'clamp(200px, 16vw, 256px)' }}
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <a
                                key={subIndex}
                                href={subItem.href}
                                className="block font-bold text-[var(--color-white)] hover:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
                                style={{ 
                                  '--hover-bg': 'var(--color-blue)',
                                  paddingLeft: 'clamp(12px, 1.5vw, 24px)',
                                  paddingRight: 'clamp(12px, 1.5vw, 24px)',
                                  paddingTop: 'clamp(6px, 0.75vw, 12px)',
                                  paddingBottom: 'clamp(6px, 0.75vw, 12px)',
                                  lineHeight: '1',
                                  fontWeight: 'normal',
                                  fontFeatureSettings: 'normal',
                                  WebkitFontSmoothing: 'antialiased',
                                  MozOsxFontSmoothing: 'grayscale',
                                  textRendering: 'optimizeLegibility',
                                  fontSize: 'clamp(10px, 1vw, 16px)'
                                } as React.CSSProperties}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '';
                                }}
                              >
                                {subItem.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        key={index}
                        href={item.href}
                        className="group/nav flex items-center font-bold text-white relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0"
                        style={{ gap: 'clamp(4px, 0.5vw, 8px)', paddingLeft: 'clamp(8px, 1vw, 16px)', paddingRight: 'clamp(8px, 1vw, 16px)', paddingTop: 'clamp(5px, 0.625vw, 10px)', paddingBottom: 'clamp(5px, 0.625vw, 10px)', fontSize: 'clamp(10px, 1vw, 16px)' }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: 'var(--color-blue)'}}></div>
                        <div className="relative z-10 flex items-center" style={{ gap: 'clamp(4px, 0.5vw, 8px)' }}>
                          <span className="font-bold group-hover/nav:text-white transition-colors" style={{ lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(10px, 1vw, 16px)' }}>{item.label}</span>
                          <ArrowRight className="text-white opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1 flex-shrink-0" style={{ width: 'clamp(12px, 1vw, 16px)', height: 'clamp(12px, 1vw, 16px)' }} />
                        </div>
                      </a>
                    )
                  ))}
                </div>
              </div>
            </nav>

            {/* Island 3: CTA */}
            <div 
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              className="glass-island glass-island-cta transition-all duration-300 ease-out cursor-default pointer-events-auto relative"
              style={{ zIndex: 30, marginTop: '-10px', height: 'clamp(50px, 4vw, 65px)', minHeight: 'clamp(50px, 4vw, 65px)', maxHeight: 'clamp(50px, 4vw, 65px)', backgroundColor: 'var(--color-peach)' }}
            >
              <div className="glass-island-inner h-full flex items-center" style={{ padding: 'clamp(8px, 1vw, 16px)', backgroundColor: 'var(--color-peach)', gap: 'clamp(6px, 0.75vw, 12px)' }}>
                {/* LinkedIn Button */}
                <a
                  href="https://www.linkedin.com/company/cdcglobal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/linkedin flex items-center justify-center text-white relative overflow-hidden rounded-lg transition-all duration-300"
                  style={{ 
                    paddingLeft: 'clamp(8px, 1vw, 16px)', 
                    paddingRight: 'clamp(8px, 1vw, 16px)', 
                    paddingTop: 'clamp(6px, 0.75vw, 12px)', 
                    paddingBottom: 'clamp(6px, 0.75vw, 12px)',
                    height: '100%',
                    alignSelf: 'stretch'
                  }}
                  aria-label="Visit our LinkedIn page"
                >
                  <div className="absolute inset-0 opacity-0 group-hover/linkedin:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: 'var(--theme-accent)'}}></div>
                  <div className="relative z-10 flex items-center justify-center">
                    <Linkedin className="text-white flex-shrink-0" style={{ width: 'clamp(16px, 1.5vw, 24px)', height: 'clamp(16px, 1.5vw, 24px)' }} />
                  </div>
                </a>
                <FlipButton
                  href={cta?.href || "#contact"}
                  frontText={cta?.label || "Get In Touch"}
                  backText={cta?.label || "Get In Touch"}
                  from="top"
                  className="w-full h-full"
                  frontClassName="bg-[var(--color-blue)] text-white font-bold rounded-lg"
                  backClassName="bg-[var(--color-white)] text-[var(--color-blue)] font-bold rounded-lg"
                  style={{ 
                    marginLeft: 'clamp(4px, 0.5vw, 8px)', 
                    paddingLeft: 'clamp(10px, 1.25vw, 20px)', 
                    paddingRight: 'clamp(10px, 1.25vw, 20px)', 
                    paddingTop: 'clamp(6px, 0.75vw, 12px)', 
                    paddingBottom: 'clamp(6px, 0.75vw, 12px)',
                    fontSize: 'clamp(10px, 1vw, 16px)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      {/* Work With Us mega panel under header */}
      {(activeDropdown === 'Work With Us' || (isAnimatingOut && animatingOutLabel === 'Work With Us')) && (
        <>
          {/* Invisible bridge to catch mouse in gap */}
          <div
            className={`absolute left-0 right-0 top-full h-1 ${isMobile ? 'hidden' : ''}`}
            onMouseEnter={() => !isMobile && handleDropdownEnter('Work With Us')}
            onMouseLeave={() => !isMobile && handleDropdownLeave('Work With Us')}
            style={{ pointerEvents: 'auto', zIndex: 49 }}
          />
          <div
            ref={(el) => {
              if (el) dropdownRefs.current.set('Work With Us', el);
            }}
            className={`absolute left-0 right-0 top-full z-50 ${isMobile ? 'hidden' : ''}`}
            style={{ paddingTop: '0px', pointerEvents: activeDropdown === 'Work With Us' ? 'auto' : 'none' }}
            onMouseEnter={() => !isMobile && handleDropdownEnter('Work With Us')}
            onMouseLeave={() => !isMobile && handleDropdownLeave('Work With Us')}
          >
            <div className="bg-[var(--color-peach)] rounded-2xl overflow-hidden" style={{ marginLeft: 'clamp(16px, 2vw, 32px)', marginRight: 'clamp(16px, 2vw, 32px)' }}
            >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <a
                href="/work-with-us#client"
                className="group flex items-center justify-between transition-colors"
                style={{ 
                  padding: 'clamp(16px, 2vw, 32px)', 
                  gap: 'clamp(12px, 1.5vw, 24px)',
                  '--hover-bg': 'var(--color-blue)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <div>
                  <div className="font-bold text-[var(--color-white)] group-hover:text-white" style={{ lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(18px, 1.875vw, 30px)' }}>Solve My Hiring Headaches</div>
                  <div className="mt-2 text-[var(--color-white)]/80 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(12px, 1vw, 16px)' }}>For companies hiring leadership and specialists</div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" style={{ width: 'clamp(20px, 1.75vw, 28px)', height: 'clamp(20px, 1.75vw, 28px)' }} />
              </a>
              <a
                href="/work-with-us#candidate"
                className="group flex items-center justify-between transition-colors border-t md:border-t-0 md:border-l"
                style={{ 
                  padding: 'clamp(16px, 2vw, 32px)', 
                  gap: 'clamp(12px, 1.5vw, 24px)',
                  '--hover-bg': 'var(--color-blue)',
                  borderColor: 'var(--theme-background)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <div>
                  <div className="font-bold text-[var(--color-white)] group-hover:text-white" style={{ lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(18px, 1.875vw, 30px)' }}>Find My Dream Role</div>
                  <div className="mt-2 text-[var(--color-white)]/80 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(12px, 1vw, 16px)' }}>For candidates exploring their next move</div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" style={{ width: 'clamp(20px, 1.75vw, 28px)', height: 'clamp(20px, 1.75vw, 28px)' }} />
              </a>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Proof in the People mega panel under header */}
      {(activeDropdown === 'Proof in the People' || (isAnimatingOut && animatingOutLabel === 'Proof in the People')) && (
        <>
          {/* Invisible bridge to catch mouse in gap */}
          <div
            className={`absolute left-0 right-0 top-full h-1 ${isMobile ? 'hidden' : ''}`}
            onMouseEnter={() => !isMobile && handleDropdownEnter('Proof in the People')}
            onMouseLeave={() => !isMobile && handleDropdownLeave('Proof in the People')}
            style={{ pointerEvents: 'auto', zIndex: 49 }}
          />
          <div
            ref={(el) => {
              if (el) dropdownRefs.current.set('Proof in the People', el);
            }}
            className={`absolute left-0 right-0 top-full z-50 ${isMobile ? 'hidden' : ''}`}
            style={{ paddingTop: '0px', pointerEvents: activeDropdown === 'Proof in the People' ? 'auto' : 'none' }}
            onMouseEnter={() => !isMobile && handleDropdownEnter('Proof in the People')}
            onMouseLeave={() => !isMobile && handleDropdownLeave('Proof in the People')}
          >
            <div className="bg-[var(--color-peach)] rounded-2xl overflow-hidden" style={{ marginLeft: 'clamp(16px, 2vw, 32px)', marginRight: 'clamp(16px, 2vw, 32px)' }}
            >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <a
                href="/proof-in-the-people#testimonials"
                className="group flex items-center justify-between transition-colors"
                style={{ 
                  padding: 'clamp(16px, 2vw, 32px)', 
                  gap: 'clamp(12px, 1.5vw, 24px)',
                  '--hover-bg': 'var(--color-blue)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <div>
                  <div className="font-bold text-[var(--color-white)] group-hover:text-white" style={{ lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(18px, 1.875vw, 30px)' }}>Read Our Testimonials</div>
                  <div className="mt-2 text-[var(--color-white)]/80 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(12px, 1vw, 16px)' }}>Hear from clients and candidates about their experience</div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" style={{ width: 'clamp(20px, 1.75vw, 28px)', height: 'clamp(20px, 1.75vw, 28px)' }} />
              </a>
              <a
                href="/proof-in-the-people#case-studies"
                className="group flex items-center justify-between transition-colors border-t md:border-t-0 md:border-l"
                style={{ 
                  padding: 'clamp(16px, 2vw, 32px)', 
                  gap: 'clamp(12px, 1.5vw, 24px)',
                  '--hover-bg': 'var(--color-blue)',
                  borderColor: 'var(--theme-background)',
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                }}
              >
                <div>
                  <div className="font-bold text-[var(--color-white)] group-hover:text-white" style={{ lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(18px, 1.875vw, 30px)' }}>Check Out Our Case Studies</div>
                  <div className="mt-2 text-[var(--color-white)]/80 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility', fontSize: 'clamp(12px, 1vw, 16px)' }}>Explore detailed examples of our successful placements</div>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" style={{ width: 'clamp(20px, 1.75vw, 28px)', height: 'clamp(20px, 1.75vw, 28px)' }} />
              </a>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Mobile Navigation Overlay */}
      <div
        ref={mobileOverlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2147483646] md:hidden"
        style={{ display: 'none' }}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Navigation Menu - Slide in from right */}
      <div
        ref={mobileMenuRef}
        className="fixed top-0 right-0 h-full w-[85vw] max-w-[400px] bg-[var(--color-peach)] z-[2147483647] md:hidden shadow-2xl"
        style={{ display: 'none', overflowY: 'auto' }}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="text-white font-bold" style={{ fontSize: 'clamp(18px, 2vw, 24px)', fontFamily: 'TexGyreAdventor' }}>
            Menu
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white hover:bg-white/20 rounded-lg transition-colors p-2"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content */}
        <nav className="flex flex-col" style={{ padding: 'clamp(16px, 2vw, 24px)', gap: 'clamp(8px, 1vw, 12px)', minHeight: '200px' }}>
          {items && items.length > 0 ? items.map((item, index) => {
            let itemIndex = index;
            return (
            <div
              key={index}
              ref={(el) => {
                if (el) {
                  // Ensure array is large enough
                  while (mobileNavItemsRef.current.length <= itemIndex) {
                    mobileNavItemsRef.current.push(null);
                  }
                  mobileNavItemsRef.current[itemIndex] = el;
                  // Ensure item is visible
                  gsap.set(el, { opacity: 1, x: 0 });
                }
              }}
              style={{ opacity: 1, visibility: 'visible' }}
            >
              {item.submenu ? (
                <div>
                  <button
                    className="w-full flex items-center justify-between font-bold text-white relative overflow-hidden rounded-xl transition-all duration-300 group"
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    style={{
                      paddingLeft: 'clamp(16px, 2vw, 24px)',
                      paddingRight: 'clamp(16px, 2vw, 24px)',
                      paddingTop: 'clamp(14px, 1.75vw, 20px)',
                      paddingBottom: 'clamp(14px, 1.75vw, 20px)',
                      fontSize: 'clamp(16px, 1.75vw, 20px)',
                      lineHeight: '1',
                      fontWeight: 'normal',
                      fontFeatureSettings: 'normal',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      textRendering: 'optimizeLegibility',
                      backgroundColor: activeDropdown === item.label ? 'var(--color-blue)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeDropdown !== item.label) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeDropdown !== item.label) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`transition-transform duration-300 ${activeDropdown === item.label ? 'rotate-180' : ''}`}
                      style={{ width: 'clamp(18px, 1.5vw, 20px)', height: 'clamp(18px, 1.5vw, 20px)', flexShrink: 0 }}
                    />
                  </button>
                  {activeDropdown === item.label && (
                    <div
                      className="mt-2 overflow-hidden"
                      style={{
                        paddingLeft: 'clamp(16px, 2vw, 24px)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(4px, 0.5vw, 8px)'
                      }}
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <a
                          key={subIndex}
                          href={subItem.href}
                          className="block font-bold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                          style={{
                            paddingLeft: 'clamp(16px, 2vw, 24px)',
                            paddingRight: 'clamp(16px, 2vw, 24px)',
                            paddingTop: 'clamp(10px, 1.25vw, 14px)',
                            paddingBottom: 'clamp(10px, 1.25vw, 14px)',
                            fontSize: 'clamp(14px, 1.5vw, 18px)',
                            lineHeight: '1',
                            fontWeight: 'normal',
                            fontFeatureSettings: 'normal',
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href={item.href}
                  className="group/nav flex items-center font-bold text-white relative overflow-hidden rounded-xl transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    gap: 'clamp(8px, 1vw, 12px)',
                    paddingLeft: 'clamp(16px, 2vw, 24px)',
                    paddingRight: 'clamp(16px, 2vw, 24px)',
                    paddingTop: 'clamp(14px, 1.75vw, 20px)',
                    paddingBottom: 'clamp(14px, 1.75vw, 20px)',
                    fontSize: 'clamp(16px, 1.75vw, 20px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{ backgroundColor: 'var(--color-blue)' }}></div>
                  <div className="relative z-10 flex items-center w-full justify-between" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
                    <span
                      style={{
                        lineHeight: '1',
                        fontWeight: 'normal',
                        fontFeatureSettings: 'normal',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility'
                      }}
                    >
                      {item.label}
                    </span>
                    <ArrowRight className="opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" style={{ width: 'clamp(16px, 1.5vw, 20px)', height: 'clamp(16px, 1.5vw, 20px)', flexShrink: 0 }} />
                  </div>
                </a>
              )}
            </div>
            );
          }) : (
            <div className="text-white/60 text-center py-4" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)' }}>
              No menu items available
            </div>
          )}
          
          {/* Contact Link - Mobile */}
          <div
            ref={(el) => {
              if (el) {
                const contactIndex = items ? items.length : 0;
                while (mobileNavItemsRef.current.length <= contactIndex) {
                  mobileNavItemsRef.current.push(null);
                }
                mobileNavItemsRef.current[contactIndex] = el;
                gsap.set(el, { opacity: 1, x: 0 });
              }
            }}
            className="mt-4 pt-4 border-t border-white/20"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            <a
              href="/contact"
              className="group/nav flex items-center font-bold text-white relative overflow-hidden rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
              style={{
                gap: 'clamp(8px, 1vw, 12px)',
                paddingLeft: 'clamp(16px, 2vw, 24px)',
                paddingRight: 'clamp(16px, 2vw, 24px)',
                paddingTop: 'clamp(14px, 1.75vw, 20px)',
                paddingBottom: 'clamp(14px, 1.75vw, 20px)',
                fontSize: 'clamp(16px, 1.75vw, 20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{ backgroundColor: 'var(--color-blue)' }}></div>
              <div className="relative z-10 flex items-center w-full justify-between" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
                <span
                  style={{
                    lineHeight: '1',
                    fontWeight: 'normal',
                    fontFeatureSettings: 'normal',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  Contact
                </span>
                <ArrowRight className="opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" style={{ width: 'clamp(16px, 1.5vw, 20px)', height: 'clamp(16px, 1.5vw, 20px)', flexShrink: 0 }} />
              </div>
            </a>
          </div>
          
          {/* LinkedIn Button - Mobile */}
          <div
            ref={(el) => {
              if (el) {
                const linkedInIndex = (items ? items.length : 0) + 1; // +1 for Contact
                while (mobileNavItemsRef.current.length <= linkedInIndex) {
                  mobileNavItemsRef.current.push(null);
                }
                mobileNavItemsRef.current[linkedInIndex] = el;
                gsap.set(el, { opacity: 1, x: 0 });
              }
            }}
            className="mt-4 pt-4 border-t border-white/20"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            <a
              href="https://www.linkedin.com/company/cdcglobal/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/linkedin flex items-center font-bold text-white relative overflow-hidden rounded-xl transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
              style={{
                gap: 'clamp(8px, 1vw, 12px)',
                paddingLeft: 'clamp(16px, 2vw, 24px)',
                paddingRight: 'clamp(16px, 2vw, 24px)',
                paddingTop: 'clamp(14px, 1.75vw, 20px)',
                paddingBottom: 'clamp(14px, 1.75vw, 20px)',
                fontSize: 'clamp(16px, 1.75vw, 20px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover/linkedin:opacity-100 transition-opacity duration-300 rounded-xl" style={{ backgroundColor: 'var(--color-blue)' }}></div>
              <div className="relative z-10 flex items-center" style={{ gap: 'clamp(8px, 1vw, 12px)' }}>
                <Linkedin className="text-white" style={{ width: 'clamp(20px, 2vw, 24px)', height: 'clamp(20px, 2vw, 24px)', flexShrink: 0 }} />
                <span
                  style={{
                    lineHeight: '1',
                    fontWeight: 'normal',
                    fontFeatureSettings: 'normal',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility'
                  }}
                >
                  LINKEDIN
                </span>
              </div>
            </a>
          </div>

          {/* CTA Button - Mobile */}
          <div
            ref={(el) => {
              if (el) {
                const ctaIndex = (items ? items.length : 0) + 2; // +1 for Contact, +1 for LinkedIn
                while (mobileNavItemsRef.current.length <= ctaIndex) {
                  mobileNavItemsRef.current.push(null);
                }
                mobileNavItemsRef.current[ctaIndex] = el;
                gsap.set(el, { opacity: 1, x: 0 });
              }
            }}
            className="mt-4 pt-4 border-t border-white/20"
            style={{ opacity: 1, visibility: 'visible' }}
          >
            <FlipButton
              href={cta?.href || "#contact"}
              frontText={cta?.label || "Get In Touch"}
              backText={cta?.label || "Get In Touch"}
              from="top"
              className="w-full"
              frontClassName="bg-[var(--color-blue)] text-white font-bold rounded-xl"
              backClassName="bg-[var(--color-white)] text-[var(--color-blue)] font-bold rounded-xl"
              onClick={() => setIsMenuOpen(false)}
              style={{
                paddingLeft: 'clamp(16px, 2vw, 24px)',
                paddingRight: 'clamp(16px, 2vw, 24px)',
                paddingTop: 'clamp(14px, 1.75vw, 20px)',
                paddingBottom: 'clamp(14px, 1.75vw, 20px)',
                fontSize: 'clamp(16px, 1.75vw, 20px)'
              }}
            />
          </div>
        </nav>
      </div>
      </div>
    </header>
    </>
  );
}