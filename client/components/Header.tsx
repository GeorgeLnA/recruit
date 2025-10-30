import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
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
    if (label === 'Work With Us' && isAnimatingOut) {
      setIsAnimatingOut(false);
      // Kill any ongoing GSAP animations and reset position immediately
      const dropdownEl = dropdownRefs.current.get('Work With Us');
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
    if (label === 'Work With Us') {
      // Small delay before starting exit animation to allow moving to panel
      dropdownTimeoutRef.current = setTimeout(() => {
        setIsAnimatingOut(true);
        // Then wait for animation to complete before closing
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimatingOut(false);
          setActiveDropdown(null);
        }, 750); // Match animation duration (700ms) + small buffer
      }, 150); // Initial delay to allow moving between button and panel
    } else {
      dropdownTimeoutRef.current = setTimeout(() => {
        setActiveDropdown(null);
      }, 150); // Small delay to allow moving to panel
    }
  };

  // Animate dropdown morphing from button
  useEffect(() => {
    items.forEach((item) => {
      if (!item.submenu) return;
      
      const dropdownEl = dropdownRefs.current.get(item.label);
      const buttonEl = buttonRefs.current.get(item.label);
      
      if (!dropdownEl || !buttonEl) return;
      
      if (activeDropdown === item.label) {
        // Special handling for "Work With Us" mega panel - slide from left
        if (item.label === 'Work With Us') {
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
          
          gsap.set(dropdownEl, { opacity: 1 });
          
          gsap.fromTo(dropdownEl, {
            x: -targetWidth,
            transformOrigin: 'left center'
          }, {
            x: 0,
            duration: 1.0,
            ease: 'power3.out'
          });
          
          if (innerPanel) {
            gsap.fromTo(innerPanel, {
              scaleX: 0,
              transformOrigin: 'left center'
            }, {
              scaleX: 1,
              duration: 1.0,
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
        // Animate out (skip Work With Us - handled separately)
        if (item.label !== 'Work With Us') {
          // Regular dropdown animate out
          gsap.to(dropdownEl, {
            opacity: 0,
            scale: 0.95,
            y: -10,
            duration: 0.2,
            ease: 'power2.in'
          });
        }
      }
    });
  }, [activeDropdown, items]);

  // Handle exit animation for Work With Us panel
  useEffect(() => {
    if (!isAnimatingOut) return;
    
    const dropdownEl = dropdownRefs.current.get('Work With Us');
    if (!dropdownEl) return;
    
    const dropdownRect = dropdownEl.getBoundingClientRect();
    const innerPanel = dropdownEl.querySelector('div') as HTMLElement;
    
    // Smooth slide to right for mega panel exit
    gsap.to(dropdownEl, {
      x: window.innerWidth,
      duration: 0.7,
      ease: 'power3.in'
    });
    
    if (innerPanel) {
      gsap.to(innerPanel, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.7,
        ease: 'power3.in'
      });
    }
  }, [isAnimatingOut]);

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
      {/* Simple square with circular cutout - positioned just under logo island top left */}
      <div 
        style={{ 
          position: 'fixed',
          top: '63px',
          left: '12px',
          zIndex: 2147483649,
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          mask: 'radial-gradient(circle at center, transparent 20px, white 20px)',
          WebkitMask: 'radial-gradient(circle at center, transparent 20px, white 20px)',
          clipPath: 'polygon(0 0, 20px 0, 20px 20px, 0 20px)',
          WebkitClipPath: 'polygon(0 0, 20px 0, 20px 20px, 0 20px)',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      />
      
      {/* Mirrored square with circular cutout - positioned just under CTA island top right */}
      <div 
        style={{ 
          position: 'fixed',
          top: '63px',
          right: '12px',
          zIndex: 2147483649,
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 1)',
          mask: 'radial-gradient(circle at center, transparent 20px, white 20px)',
          WebkitMask: 'radial-gradient(circle at center, transparent 20px, white 20px)',
          clipPath: 'polygon(20px 0, 40px 0, 40px 20px, 20px 20px)',
          WebkitClipPath: 'polygon(20px 0, 40px 0, 40px 20px, 20px 20px)',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      />
      
      {/* Frame stuck to viewport with rounded corners */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: 2147483647,
          borderLeft: '13px solid rgba(255, 255, 255, 1)',
          borderRight: '13px solid rgba(255, 255, 255, 1)',
          borderBottom: '13px solid rgba(255, 255, 255, 1)',
          borderTop: 'none',
          borderRadius: '24px'
        }}
      />
      {/* Triangle corners */}
      <div 
        className="fixed top-0 left-0 pointer-events-none"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderTop: '13px solid rgba(255, 255, 255, 1)',
          borderLeft: '13px solid rgba(255, 255, 255, 1)',
          borderRight: '13px solid transparent',
          borderBottom: '13px solid transparent'
        }}
      />
      <div 
        className="fixed top-0 right-0 pointer-events-none"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderTop: '13px solid rgba(255, 255, 255, 1)',
          borderRight: '13px solid rgba(255, 255, 255, 1)',
          borderLeft: '13px solid transparent',
          borderBottom: '13px solid transparent'
        }}
      />
      <div 
        className="fixed bottom-0 left-0 pointer-events-none"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderBottom: '13px solid rgba(255, 255, 255, 1)',
          borderLeft: '13px solid rgba(255, 255, 255, 1)',
          borderRight: '13px solid transparent',
          borderTop: '13px solid transparent'
        }}
      />
      <div 
        className="fixed bottom-0 right-0 pointer-events-none"
        style={{ 
          zIndex: 2147483648,
          width: 0,
          height: 0,
          borderBottom: '13px solid rgba(255, 255, 255, 1)',
          borderRight: '13px solid rgba(255, 255, 255, 1)',
          borderLeft: '13px solid transparent',
          borderTop: '13px solid transparent'
        }}
      />
      
      <header 
        className={`fixed top-0 left-0 right-0 pointer-events-auto ${className}`}
        style={{ zIndex: 2147483646 }}
        role="banner"
        aria-label="Main navigation"
        onMouseEnter={handleHeaderHover}
        onMouseLeave={handleHeaderLeave}
      >
        <div className={`relative transition-all duration-300 ${
          isScrolled 
            ? 'bg-transparent' 
            : 'bg-transparent'
        }`}>
        {/* Three expanding background layers for liquid fill effect */}
        <div 
          ref={expandBg1Ref}
          className="absolute bg-white pointer-events-none"
          style={{
            opacity: 0,
            zIndex: 3,
            mixBlendMode: 'normal'
          }}
        />
        <div 
          ref={expandBg2Ref}
          className="absolute bg-white pointer-events-none"
          style={{
            opacity: 0,
            zIndex: 4,
            mixBlendMode: 'normal'
          }}
        />
        <div 
          ref={expandBg3Ref}
          className="absolute bg-white pointer-events-none"
          style={{
            opacity: 0,
            zIndex: 5,
            mixBlendMode: 'normal'
          }}
        />
        
        <div 
          ref={headerContainerRef}
          className="flex items-center justify-between w-full relative z-10 pointer-events-auto"
          style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '20px' }}
        >
          
          {/* Island 1: Logo */}
          <div 
            ref={logoRef as React.RefObject<HTMLDivElement>}
            className="glass-island glass-island-logo transition-all duration-300 ease-out cursor-default pointer-events-auto relative"
            style={{ zIndex: 30, marginTop: '-10px', height: '65px', minHeight: '65px', maxHeight: '65px' }}
          >
            <div className="glass-island-inner flex items-center h-full" style={{ padding: '16px' }}>
              <a href="/" className="flex items-center">
                <div className="text-gray-900 whitespace-nowrap flex items-center" style={{fontFamily: 'Milker', fontSize: '28px', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}>
                  CDC
                </div>
              </a>
            </div>
          </div>

          {/* Island 2: Navigation */}
          <nav 
            ref={navRef}
            className="glass-island hidden md:flex items-center transition-all duration-300 ease-out cursor-default pointer-events-auto relative"
            style={{ zIndex: 30, marginTop: '-10px', height: '65px', minHeight: '65px', maxHeight: '65px' }}
          >
            <div className="glass-island-inner h-full flex items-center" style={{ padding: '16px' }}>
              <div className="flex items-center" style={{ gap: '20px' }}>
                {items.map((item, index) => (
                  item.submenu ? (
                    <div
                      key={index}
                      className="relative group/nav"
                      onMouseEnter={() => {
                        if (item.label === 'Work With Us') {
                          handleDropdownEnter(item.label);
                        } else {
                          setActiveDropdown(item.label);
                        }
                      }}
                      onMouseLeave={() => {
                        if (item.label === 'Work With Us') {
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
                        className="flex items-center text-base font-bold text-gray-900 relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
                        style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px' }}
                        onClick={() => {
                          if (item.label === 'Work With Us') {
                            window.location.href = '/work-with-us#client';
                          }
                        }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: '#ff3a34'}}></div>
                        <div className="relative z-10 flex items-center" style={{ gap: '8px' }}>
                          <span className="text-base font-bold group-hover/nav:text-white transition-colors" style={{fontFamily: 'Milker', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}>{item.label}</span>
                          <ChevronDown className="w-4 h-4 text-gray-900 group-hover/nav:text-white transition-all duration-300" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                        </div>
                      </button>
                      {item.label !== 'Work With Us' && activeDropdown === item.label && (
                        <div 
                          ref={(el) => {
                            if (el) dropdownRefs.current.set(item.label, el);
                          }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                        >
                          {item.submenu.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.href}
                              className="block text-base font-bold text-gray-900 hover:bg-[#ff3a34] hover:text-white transition-colors first:rounded-t-xl last:rounded-b-xl"
                              style={{fontFamily: 'Milker', paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}
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
                      className="group/nav flex items-center text-base font-bold text-gray-900 relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
                      style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px' }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-lg" style={{backgroundColor: '#ff3a34'}}></div>
                      <div className="relative z-10 flex items-center" style={{ gap: '8px' }}>
                        <span className="text-base font-bold group-hover/nav:text-white transition-colors" style={{fontFamily: 'Milker', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}>{item.label}</span>
                        <ArrowRight className="w-4 h-4 text-white opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
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
            style={{ zIndex: 30, marginTop: '-10px', height: '65px', minHeight: '65px', maxHeight: '65px' }}
          >
            <div className="glass-island-inner h-full flex items-center" style={{ padding: '16px' }}>
              <a
                href={cta?.href || "#contact"}
                className="inline-flex items-center justify-center rounded-lg text-white font-bold text-base transition-all duration-300 w-full h-full relative overflow-hidden"
                style={{backgroundColor: '#ff3a34', fontFamily: 'Milker', marginLeft: '8px', gap: '8px', paddingLeft: '20px', paddingRight: '20px', paddingTop: '12px', paddingBottom: '12px'}}
              >
                <span className="text-center relative z-10 transition-colors duration-300" style={{ lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}>
                  {cta?.label || "JOIN"}
                </span>
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            style={{ padding: '8px', marginLeft: '16px' }}
          >
            {isMenuOpen ? <X className="w-6 h-6" style={{ width: '24px', height: '24px', flexShrink: 0 }} /> : <Menu className="w-6 h-6" style={{ width: '24px', height: '24px', flexShrink: 0 }} />}
          </button>
        </div>

      {/* Work With Us mega panel under header */}
      {(activeDropdown === 'Work With Us' || isAnimatingOut) && (
        <>
          {/* Invisible bridge to catch mouse in gap */}
          <div
            className="absolute left-0 right-0 top-full h-1"
            onMouseEnter={() => handleDropdownEnter('Work With Us')}
            onMouseLeave={() => handleDropdownLeave('Work With Us')}
            style={{ pointerEvents: 'auto', zIndex: 49 }}
          />
          <div
            ref={(el) => {
              if (el) dropdownRefs.current.set('Work With Us', el);
            }}
            className="absolute left-0 right-0 top-full z-50"
            style={{ paddingTop: '0px' }}
            onMouseEnter={() => handleDropdownEnter('Work With Us')}
            onMouseLeave={() => handleDropdownLeave('Work With Us')}
          >
            <div className="mx-4 md:mx-8 bg-white/95 backdrop-blur rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <a
                href="/work-with-us#client"
                className="group flex items-center justify-between hover:bg-[#ff3a34] transition-colors"
                style={{ padding: '32px', gap: '24px' }}
              >
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-white" style={{ fontFamily: 'Milker', lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}>Solve my hiring headaches</div>
                  <div className="mt-2 text-gray-600 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}>For companies hiring leadership and specialists</div>
                </div>
                <ArrowRight className="w-7 h-7 text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
              </a>
              <a
                href="/work-with-us#candidate"
                className="group flex items-center justify-between hover:bg-[#ff3a34] transition-colors border-t md:border-t-0 md:border-l border-gray-200"
                style={{ padding: '32px', gap: '24px' }}
              >
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-white" style={{ fontFamily: 'Milker', lineHeight: '1.2', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}>Find my dream role</div>
                  <div className="mt-2 text-gray-600 group-hover:text-white/90" style={{ lineHeight: '1.5', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility' }}>For candidates exploring their next move</div>
                </div>
                <ArrowRight className="w-7 h-7 text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:translate-x-1" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
              </a>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-brand-orange border-t border-white/20 md:hidden">
            <nav className="flex flex-col" style={{ gap: '8px', padding: '16px' }}>
              {items.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between text-lg font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500"
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        style={{fontFamily: 'Milker', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}
                      >
                        {item.label}
                        <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} style={{ width: '20px', height: '20px', flexShrink: 0 }} />
                      </button>
                      {activeDropdown === item.label && (
                        <div className="pl-4 mt-2" style={{ paddingLeft: '16px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {item.submenu.map((subItem, subIndex) => (
                            <a
                              key={subIndex}
                              href={subItem.href}
                              className="block text-base font-bold text-white hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                              style={{fontFamily: 'Milker', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}
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
                      className="group/nav flex items-center text-lg font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ gap: '8px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px' }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{backgroundColor: '#ff3a34'}}></div>
                      <div className="relative z-10 flex items-center" style={{ gap: '8px' }}>
                        <span className="text-lg font-bold" style={{fontFamily: 'Milker', lineHeight: '1', fontWeight: 'normal', fontFeatureSettings: 'normal', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', textRendering: 'optimizeLegibility'}}>{item.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                      </div>
                    </a>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  );
}