import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/gsap";
import LifeSciencesIcons from "@/components/LifeSciencesIcons";
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
    // Reset form
    setFormData({ name: "", email: "", message: "" });
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
        className="relative pt-48 px-6 overflow-hidden min-h-screen" 
        style={{ backgroundColor: '#FF914D' }}
      >
        {/* Life Sciences Icons */}
        <LifeSciencesIcons count={12} side="both" size={70} />
        
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

        <div className="max-w-7xl mx-auto relative z-10 pb-32">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 
              ref={titleRef}
              className="text-8xl md:text-9xl lg:text-[140px] font-bold mb-8 text-center text-white"
              style={{ fontFamily: 'TexGyreAdventor' }}
            >
              Get In Touch
            </h1>
            <p className="text-white/90 text-xl md:text-2xl max-w-3xl mx-auto" style={{ fontFamily: 'TexGyreAdventor' }}>
              Ready to find your next opportunity or the perfect candidate? Let's start a conversation.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div ref={formRef} className="order-2 lg:order-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8" style={{ fontFamily: 'TexGyreAdventor' }}>
                  Send us a message
                </h2>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-white text-sm font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      placeholder="Your name"
                      style={{ fontFamily: 'TexGyreAdventor' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white text-sm font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                      style={{ fontFamily: 'TexGyreAdventor' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white text-sm font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your needs..."
                      style={{ fontFamily: 'TexGyreAdventor' }}
                    />
                  </div>

                  <div className="pt-4">
                    <FlipButton
                      frontText="Send Message"
                      backText="Sent!"
                      from="top"
                      className="w-full"
                      frontClassName="bg-[#00BFFF] text-white font-bold text-lg rounded-lg py-4"
                      backClassName="bg-white text-[#00BFFF] font-bold text-lg rounded-lg py-4"
                      type="submit"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div ref={infoRef} className="order-1 lg:order-2">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-8" style={{ fontFamily: 'TexGyreAdventor' }}>
                    Contact Information
                  </h2>
                  <p className="text-white/90 text-lg md:text-xl mb-8" style={{ fontFamily: 'TexGyreAdventor' }}>
                    Whether you're looking to fill a role or explore new opportunities, we're here to help.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                        Address
                      </h3>
                      <p className="text-white/90 text-base" style={{ fontFamily: 'TexGyreAdventor' }}>
                        65 Arthurs Avenue<br />
                        Harrogate, North Yorkshire<br />
                        United Kingdom, HG2 0EB
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                        Email
                      </h3>
                      <div className="space-y-1">
                        <a 
                          href="mailto:harriet@cdcglobal.co.uk" 
                          className="block text-white/90 hover:text-white transition-colors text-base"
                          style={{ fontFamily: 'TexGyreAdventor' }}
                        >
                          harriet@cdcglobal.co.uk
                        </a>
                        <a 
                          href="mailto:adam@cdcglobal.co.uk" 
                          className="block text-white/90 hover:text-white transition-colors text-base"
                          style={{ fontFamily: 'TexGyreAdventor' }}
                        >
                          adam@cdcglobal.co.uk
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                        Phone
                      </h3>
                      <p className="text-white/90 text-base" style={{ fontFamily: 'TexGyreAdventor' }}>
                        Available upon request
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pt-8 border-t border-white/20">
                  <h3 className="text-white font-bold text-xl mb-4 uppercase tracking-wider" style={{ fontFamily: 'TexGyreAdventor' }}>
                    Quick Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="/work-with-us#client"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-semibold transition-all hover:scale-105"
                      style={{ fontFamily: 'TexGyreAdventor' }}
                    >
                      For Clients
                    </a>
                    <a 
                      href="/work-with-us#candidate"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-semibold transition-all hover:scale-105"
                      style={{ fontFamily: 'TexGyreAdventor' }}
                    >
                      For Candidates
                    </a>
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

