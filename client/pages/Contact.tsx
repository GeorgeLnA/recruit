import { useEffect, useRef } from "react";
import Footer from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/gsap";
import { Mail, Phone, MapPin, Linkedin, ArrowRight, Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// LinkedIn Connection Section Component
function LinkedInConnectionSection() {
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const harrietCardRef = useRef<HTMLAnchorElement>(null);
  const adamCardRef = useRef<HTMLAnchorElement>(null);
  const companyCardRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (sectionRef.current) {
      const title = sectionRef.current.querySelector('h2');
      const sparkles = sectionRef.current.querySelectorAll('.sparkle-icon');
      
      // Title animation with stagger
      if (title) {
        gsap.from(title, {
          y: 40,
          opacity: 0,
          scale: 0.9,
          duration: 1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true
          }
        });
      }

      // Sparkles animation
      if (sparkles.length > 0) {
        gsap.from(sparkles, {
          scale: 0,
          rotation: -180,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
          stagger: 0.2,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            once: true
          }
        });
      }
    }

    // Enhanced card entrance animations with stagger
    const cards = [harrietCardRef, companyCardRef, adamCardRef];
    
    cards.forEach((ref, index) => {
      if (ref.current) {
        const card = ref.current;
        const avatar = card.querySelector('img');
        const content = card.querySelector('div > div:first-child');
        const button = card.querySelector('div:last-child');
        
        // Set initial state - card starts visible but slightly offset for entrance
        gsap.set(card, { opacity: 1, y: 40, rotationX: -10 });
        // Keep all content visible from start
        gsap.set(avatar, { scale: 1, rotation: 0, opacity: 1 });
        gsap.set(content, { opacity: 1, y: 0, visibility: 'visible' });
        gsap.set(button, { opacity: 1, x: 0, visibility: 'visible' });
        
        // Create timeline for each card
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true
          }
        });
        
        // Card entrance animation - smooth slide up
        tl.to(card, {
          y: 0,
          rotationX: 0,
          duration: 0.8,
          delay: index * 0.2,
          ease: 'power3.out'
        })
        // Avatar bounce animation for visual interest
        .to(avatar, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(2)'
        }, '-=0.4')
        .to(avatar, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        // Content and button remain visible throughout
      }
    });
  }, []);

  // Enhanced hover animations for cards - smooth and stable (desktop only)
  useEffect(() => {
    if (isMobile) return; // Disable hover animations on mobile
    
    const cards = [harrietCardRef, companyCardRef, adamCardRef];
    const animations = new Map<HTMLElement, { float?: gsap.core.Tween; hover?: gsap.core.Timeline }>();
    
    cards.forEach((ref) => {
      const card = ref.current;
      if (!card) return;

      const avatar = card.querySelector('img');
      const button = card.querySelector('div:last-child');
      const arrow = button?.querySelector('svg');
      const glow = card.querySelector('.absolute.top-0.right-0');

      // Set initial state and perspective - ensure clean starting point
      gsap.set(card, { 
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        y: 0,
        scale: 1,
        rotationY: 0,
        rotationX: 0,
        x: 0
      });
      
      if (avatar) gsap.set(avatar, { scale: 1, rotation: 0 });
      if (button) gsap.set(button, { x: 0 });
      if (arrow) gsap.set(arrow, { x: 0, scale: 1 });
      if (glow) gsap.set(glow, { scale: 1, opacity: 0.2 });
      
      // Store base values
      const baseState = {
        card: { y: 0, scale: 1, rotationY: 0 },
        avatar: { scale: 1, rotation: 0 },
        button: { x: 0 },
        arrow: { x: 0, scale: 1 },
        glow: { scale: 1, opacity: 0.2 }
      };

      const handleMouseEnter = () => {
        // Kill all existing animations first
        const existing = animations.get(card);
        if (existing?.float) existing.float.kill();
        if (existing?.hover) existing.hover.kill();
        gsap.killTweensOf([card, avatar, button, arrow, glow]);
        
        // Ensure card and all content is visible if hover happens before scroll animation
        const currentOpacity = gsap.getProperty(card, 'opacity') as number;
        if (currentOpacity === 0 || currentOpacity < 1) {
          gsap.set(card, { opacity: 1, visibility: 'visible' });
        }
        
        // Ensure content elements are visible
        const content = card.querySelector('div > div:first-child');
        if (content) {
          gsap.set(content, { opacity: 1, visibility: 'visible', y: 0 });
        }
        if (avatar) {
          const avatarScale = gsap.getProperty(avatar, 'scale') as number;
          if (avatarScale === 0) {
            gsap.set(avatar, { scale: 1, rotation: 0 });
          }
        }
        if (button) {
          gsap.set(button, { opacity: 1, visibility: 'visible', x: 0 });
        }
        
        // Create smooth hover timeline
        const hoverTl = gsap.timeline();
        
        // Card lift with rotation and scale
        hoverTl.to(card, {
          y: -12,
          scale: 1.03,
          rotationY: 2,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        // Avatar scale and slight rotation
        .to(avatar, {
          scale: 1.1,
          rotation: 5,
          duration: 0.5,
          ease: 'back.out(1.7)',
          immediateRender: false
        }, 0)
        // Button slide and arrow movement
        .to(button, {
          x: 4,
          duration: 0.4,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        .to(arrow, {
          x: 8,
          scale: 1.15,
          duration: 0.4,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        // Glow effect enhancement
        .to(glow, {
          scale: 1.3,
          opacity: 0.4,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0);

        animations.set(card, { hover: hoverTl });
      };

      const handleMouseLeave = () => {
        // Kill all animations first
        const existing = animations.get(card);
        if (existing?.float) existing.float.kill();
        if (existing?.hover) existing.hover.kill();
        gsap.killTweensOf([card, avatar, button, arrow, glow]);
        
        // Create smooth exit timeline - animate to base state
        const exitTl = gsap.timeline();
        
        exitTl.to(card, {
          y: baseState.card.y,
          scale: baseState.card.scale,
          rotationY: baseState.card.rotationY,
          duration: 0.6,
          ease: 'power2.out',
          immediateRender: false,
          clearProps: false
        }, 0)
        .to(avatar, {
          scale: baseState.avatar.scale,
          rotation: baseState.avatar.rotation,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        .to(button, {
          x: baseState.button.x,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        .to(arrow, {
          x: baseState.arrow.x,
          scale: baseState.arrow.scale,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0)
        .to(glow, {
          scale: baseState.glow.scale,
          opacity: baseState.glow.opacity,
          duration: 0.5,
          ease: 'power2.out',
          immediateRender: false
        }, 0);
      };

      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        const existing = animations.get(card);
        if (existing?.float) existing.float.kill();
        if (existing?.hover) existing.hover.kill();
        gsap.killTweensOf([card, avatar, button, arrow, glow]);
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });
  }, [isMobile]);

  return (
    <div ref={sectionRef} className="mb-16" style={{ marginBottom: 'clamp(48px, 5vw, 80px)' }}>
      <div className="text-center mb-8" style={{ marginBottom: 'clamp(32px, 3vw, 48px)' }}>
        <div className="inline-flex items-center gap-3 mb-4" style={{ marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
          <Sparkles className="sparkle-icon text-white" style={{ width: 'clamp(24px, 2vw, 32px)', height: 'clamp(24px, 2vw, 32px)' }} />
          <h2 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(32px, 3vw, 56px)' }}>
            Reach out to us on LinkedIn
          </h2>
          <Sparkles className="sparkle-icon text-white" style={{ width: 'clamp(24px, 2vw, 32px)', height: 'clamp(24px, 2vw, 32px)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ gap: 'clamp(20px, 2vw, 32px)' }}>
        {/* Harriet's Card */}
        <a
          ref={harrietCardRef}
          href="https://www.linkedin.com/in/harriet-wheat/"
          target="_blank"
          rel="noopener noreferrer"
          className="group/linkedin-card linkedin-card-mobile relative rounded-2xl overflow-hidden md:cursor-pointer"
          style={{
            backgroundColor: 'var(--color-blue)',
            padding: 'clamp(24px, 2.5vw, 40px)',
            minHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(255, 151, 82, 0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
          onMouseEnter={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 151, 82, 0.5)';
          } : undefined}
          onMouseLeave={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 151, 82, 0.3)';
          } : undefined}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-4" style={{ marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: 'clamp(64px, 5vw, 80px)', height: 'clamp(64px, 5vw, 80px)', border: '3px solid rgba(255, 255, 255, 0.3)' }}>
                <img 
                  src="/1731573981839.jpeg" 
                  alt="Harriet Wheat"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(20px, 1.75vw, 28px)' }}>
                  Harriet Wheat
                </h3>
                <p className="text-white/80" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(12px, 1vw, 16px)' }}>
                  Co-Founder
                </p>
              </div>
            </div>
            <p className="text-white/90" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.25vw, 18px)', lineHeight: '1.7' }}>
              Connect with Harriet for candidate opportunities and career guidance. With over a decade of experience in pharmaceutical recruitment, Harriet specializes in CDMO and CRO sectors, helping top talent find their ideal roles and companies build exceptional teams.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white group-hover/linkedin-card:gap-3 transition-all" style={{ marginTop: 'auto', paddingTop: 'clamp(16px, 1.5vw, 24px)' }}>
            <span className="font-semibold" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
              Contact Harriet
            </span>
            <ArrowRight className="group-hover/linkedin-card:translate-x-2 transition-transform" style={{ width: 'clamp(18px, 1.5vw, 24px)', height: 'clamp(18px, 1.5vw, 24px)' }} />
          </div>
        </a>

        {/* Company Card */}
        <a
          ref={companyCardRef}
          href="https://www.linkedin.com/company/cdcglobal/"
          target="_blank"
          rel="noopener noreferrer"
          className="group/linkedin-card linkedin-card-mobile relative rounded-2xl overflow-hidden md:cursor-pointer"
          style={{
            backgroundColor: 'var(--color-blue)',
            padding: 'clamp(24px, 2.5vw, 40px)',
            minHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(255, 151, 82, 0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
          onMouseEnter={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 151, 82, 0.5)';
          } : undefined}
          onMouseLeave={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 151, 82, 0.3)';
          } : undefined}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-4" style={{ marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: 'clamp(64px, 5vw, 80px)', height: 'clamp(64px, 5vw, 80px)', border: '3px solid rgba(255, 255, 255, 0.3)' }}>
                <img 
                  src="/cdcglobal_logo.jpeg" 
                  alt="CDC Global Solutions"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(20px, 1.75vw, 28px)' }}>
                  CDC Global Solutions.
                </h3>
                <p className="text-white/80" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(12px, 1vw, 16px)' }}>
                  Company Page
                </p>
              </div>
            </div>
            <p className="text-white/90" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.25vw, 18px)', lineHeight: '1.7' }}>
              Connect with CDC Global Solutions for industry insights, job opportunities, and company updates. Join our 12,000+ network in the Life Sciences sector. We specialize in CDMO, CRO, and Diagnostics recruitment, connecting exceptional talent with leading organizations worldwide.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white group-hover/linkedin-card:gap-3 transition-all" style={{ marginTop: 'auto', paddingTop: 'clamp(16px, 1.5vw, 24px)' }}>
            <span className="font-semibold" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
              Contact Us
            </span>
            <ArrowRight className="group-hover/linkedin-card:translate-x-2 transition-transform" style={{ width: 'clamp(18px, 1.5vw, 24px)', height: 'clamp(18px, 1.5vw, 24px)' }} />
          </div>
        </a>

        {/* Adam's Card */}
        <a
          ref={adamCardRef}
          href="https://www.linkedin.com/in/adam-hargreaves-ivd/"
          target="_blank"
          rel="noopener noreferrer"
          className="group/linkedin-card linkedin-card-mobile relative rounded-2xl overflow-hidden md:cursor-pointer"
          style={{
            backgroundColor: 'var(--color-blue)',
            padding: 'clamp(24px, 2.5vw, 40px)',
            minHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(255, 151, 82, 0.3)',
            transition: 'box-shadow 0.3s ease'
          }}
          onMouseEnter={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 151, 82, 0.5)';
          } : undefined}
          onMouseLeave={!isMobile ? (e) => {
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 151, 82, 0.3)';
          } : undefined}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center gap-3 mb-4" style={{ marginBottom: 'clamp(16px, 1.5vw, 24px)' }}>
              <div className="relative rounded-full overflow-hidden flex-shrink-0" style={{ width: 'clamp(64px, 5vw, 80px)', height: 'clamp(64px, 5vw, 80px)', border: '3px solid rgba(255, 255, 255, 0.3)' }}>
                <img 
                  src="/1731574039276.jpeg" 
                  alt="Adam Hargreaves"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(20px, 1.75vw, 28px)' }}>
                  Adam Hargreaves
                </h3>
                <p className="text-white/80" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(12px, 1vw, 16px)' }}>
                  Co-Founder
                </p>
              </div>
            </div>
            <p className="text-white/90" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.25vw, 18px)', lineHeight: '1.7' }}>
              Contact Adam for client partnerships and strategic talent solutions. Specializing in diagnostics recruitment, Adam brings years of experience and an extensive network to help companies discover the perfect talent and candidates find their ideal roles.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white group-hover/linkedin-card:gap-3 transition-all" style={{ marginTop: 'auto', paddingTop: 'clamp(16px, 1.5vw, 24px)' }}>
            <span className="font-semibold" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)' }}>
              Contact Adam
            </span>
            <ArrowRight className="group-hover/linkedin-card:translate-x-2 transition-transform" style={{ width: 'clamp(18px, 1.5vw, 24px)', height: 'clamp(18px, 1.5vw, 24px)' }} />
          </div>
        </a>
      </div>

    </div>
  );
}

export default function Contact() {
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Animate elements on scroll
  useGSAP(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 85%',
          once: true
        }
      });
    }
  }, []);

  // Add hover animations for icon containers
  useGSAP(() => {
    const iconContainers = pageRef.current?.querySelectorAll('[data-icon-container]') as NodeListOf<HTMLElement>;
    if (!iconContainers || iconContainers.length === 0) return;

    const handlers: Array<{ container: HTMLElement; enter: () => void; leave: () => void }> = [];

    iconContainers.forEach((container) => {
      const icon = container.querySelector('svg') as SVGSVGElement;
      
      const handleMouseEnter = () => {
        // Animate container
        gsap.to(container, {
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        // Animate icon - bounce/rotate effect
        if (icon) {
          gsap.to(icon, {
            scale: 1.2,
            rotation: 360,
            duration: 0.6,
            ease: 'back.out(1.7)'
          });
        }
      };

      const handleMouseLeave = () => {
        // Reset container
        gsap.to(container, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        // Reset icon
        if (icon) {
          gsap.to(icon, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      };

      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      
      handlers.push({ container, enter: handleMouseEnter, leave: handleMouseLeave });
    });

    return () => {
      handlers.forEach(({ container, enter, leave }) => {
        container.removeEventListener('mouseenter', enter);
        container.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={pageRef}
        className="relative overflow-hidden min-h-screen" 
        style={{ backgroundColor: 'var(--color-peach)', paddingTop: 'clamp(120px, 12vw, 192px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}
      >
        <div className="mx-auto relative z-10" style={{ maxWidth: '1400px', paddingBottom: 'clamp(80px, 8vw, 128px)' }}>
          {/* Header Section */}
          <div className="text-center" style={{ marginBottom: 'clamp(40px, 4vw, 64px)' }}>
            <h1 
              ref={titleRef}
              className="font-bold text-center text-white"
              style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(48px, 8vw, 140px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}
            >
              Get In Touch
            </h1>
          </div>

          {/* LinkedIn Connection Section - Primary CTA */}
          <LinkedInConnectionSection />
        </div>
      </div>

      <Footer />
    </>
  );
}

