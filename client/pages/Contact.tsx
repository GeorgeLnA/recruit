import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/gsap";
import { Mail, Phone, MapPin } from "lucide-react";
import { FlipButton } from "@/components/FlipButton";

export default function Contact() {
  const pageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    if (formRef.current) {
      gsap.from(formRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.2,
        scrollTrigger: {
          trigger: formRef.current,
          start: 'top 85%',
          once: true
        }
      });
    }

    if (infoRef.current) {
      gsap.from(infoRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power2.out',
        delay: 0.4,
        scrollTrigger: {
          trigger: infoRef.current,
          start: 'top 85%',
          once: true
        }
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Trigger flip animation
    setIsSubmitted(true);
    // Reset form after a delay
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitted(false);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
            <p className="text-white/90 mx-auto" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(16px, 1.25vw, 24px)', maxWidth: '960px' }}>
              Ready to find your next opportunity or the perfect candidate? Let's start a conversation.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 'clamp(48px, 4vw, 64px)' }}>
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border-2" style={{ backgroundColor: '#FF9752', borderColor: '#FF9752', padding: 'clamp(32px, 3vw, 48px)' }}>
                <h2 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(28px, 2.5vw, 40px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>
                  Send us a message
                </h2>
                <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.5vw, 24px)' }}>
                  <div>
                    <label htmlFor="name" className="block text-white font-semibold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(11px, 0.875vw, 14px)', marginBottom: 'clamp(8px, 0.75vw, 12px)' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: '#FFF5E5', border: '2px solid #FF9752', '--tw-ring-color': '#FF9752', fontFamily: 'TexGyreAdventor', color: '#464C53', paddingLeft: 'clamp(16px, 1.5vw, 24px)', paddingRight: 'clamp(16px, 1.5vw, 24px)', paddingTop: 'clamp(12px, 1vw, 16px)', paddingBottom: 'clamp(12px, 1vw, 16px)', fontSize: 'clamp(14px, 1vw, 18px)' } as React.CSSProperties}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white font-semibold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(11px, 0.875vw, 14px)', marginBottom: 'clamp(8px, 0.75vw, 12px)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: '#FFF5E5', border: '2px solid #FF9752', '--tw-ring-color': '#FF9752', fontFamily: 'TexGyreAdventor', color: '#464C53', paddingLeft: 'clamp(16px, 1.5vw, 24px)', paddingRight: 'clamp(16px, 1.5vw, 24px)', paddingTop: 'clamp(12px, 1vw, 16px)', paddingBottom: 'clamp(12px, 1vw, 16px)', fontSize: 'clamp(14px, 1vw, 18px)' } as React.CSSProperties}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white font-semibold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(11px, 0.875vw, 14px)', marginBottom: 'clamp(8px, 0.75vw, 12px)' }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full rounded-lg placeholder-white/60 focus:outline-none focus:ring-2 transition-all resize-none"
                      style={{ backgroundColor: '#FFF5E5', border: '2px solid #FF9752', '--tw-ring-color': '#FF9752', fontFamily: 'TexGyreAdventor', color: '#464C53', paddingLeft: 'clamp(16px, 1.5vw, 24px)', paddingRight: 'clamp(16px, 1.5vw, 24px)', paddingTop: 'clamp(12px, 1vw, 16px)', paddingBottom: 'clamp(12px, 1vw, 16px)', fontSize: 'clamp(14px, 1vw, 18px)' } as React.CSSProperties}
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <div style={{ paddingTop: 'clamp(12px, 1vw, 16px)' }}>
                    <FlipButton
                      frontText="Send Message"
                      backText={isSubmitted ? "Sent!" : "Send Message"}
                      from="top"
                      className="w-full"
                      frontClassName="bg-[#FFF5E5] text-[#464C53] font-bold rounded-lg"
                      backClassName="bg-[#464C53] text-[#FF9752] font-bold rounded-lg"
                      type="submit"
                      animate={isSubmitted ? "hover" : "initial"}
                      style={{ paddingTop: 'clamp(12px, 1vw, 16px)', paddingBottom: 'clamp(12px, 1vw, 16px)', fontSize: 'clamp(14px, 1.125vw, 18px)' }}
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div ref={infoRef} className="order-1 lg:order-2">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 2vw, 32px)' }}>
                <div>
                  <h2 className="font-bold text-white" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(28px, 2.5vw, 40px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>
                    Contact Information
                  </h2>
                  <p className="text-white/90" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(16px, 1.25vw, 20px)', marginBottom: 'clamp(24px, 2vw, 32px)' }}>
                    Whether you're looking to fill a role or explore new opportunities, we're here to help.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.5vw, 24px)' }}>
                  {/* Address */}
                  <div className="flex items-start" style={{ gap: 'clamp(12px, 1vw, 16px)' }}>
                    <div className="flex-shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF9752', width: 'clamp(40px, 3vw, 48px)', height: 'clamp(40px, 3vw, 48px)' }}>
                      <MapPin className="text-white" style={{ width: 'clamp(20px, 1.5vw, 24px)', height: 'clamp(20px, 1.5vw, 24px)' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                        Address
                      </h3>
                      <p className="text-white/90" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1vw, 16px)' }}>
                        Meydan Grandstand, 6th Floor<br />
                        Meydan Road, Nad Al Sheba<br />
                        Dubai, U.A.E.
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start" style={{ gap: 'clamp(12px, 1vw, 16px)' }}>
                    <div className="flex-shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF9752', width: 'clamp(40px, 3vw, 48px)', height: 'clamp(40px, 3vw, 48px)' }}>
                      <Mail className="text-white" style={{ width: 'clamp(20px, 1.5vw, 24px)', height: 'clamp(20px, 1.5vw, 24px)' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                        Email
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(4px, 0.5vw, 8px)' }}>
                        <a 
                          href="mailto:harriet@cdcglobal.co.uk" 
                          className="block text-white/90 hover:text-white transition-colors"
                          style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1vw, 16px)' }}
                        >
                          harriet@cdcglobal.co.uk
                        </a>
                        <a 
                          href="mailto:adam@cdcglobal.co.uk" 
                          className="block text-white/90 hover:text-white transition-colors"
                          style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1vw, 16px)' }}
                        >
                          adam@cdcglobal.co.uk
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start" style={{ gap: 'clamp(12px, 1vw, 16px)' }}>
                    <div className="flex-shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF9752', width: 'clamp(40px, 3vw, 48px)', height: 'clamp(40px, 3vw, 48px)' }}>
                      <Phone className="text-white" style={{ width: 'clamp(20px, 1.5vw, 24px)', height: 'clamp(20px, 1.5vw, 24px)' }} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1.125vw, 18px)', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                        Phone
                      </h3>
                      <a 
                        href="tel:+447554440299" 
                        className="block text-white/90 hover:text-white transition-colors"
                        style={{ fontFamily: 'TexGyreAdventor', fontSize: 'clamp(14px, 1vw, 16px)' }}
                      >
                        07554 440 299
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

