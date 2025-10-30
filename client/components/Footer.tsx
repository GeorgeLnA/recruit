export default function Footer() {
  return (
    <footer className="bg-brand-dark py-24 w-full relative">
      {/* Grain effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
          mixBlendMode: 'overlay',
          zIndex: 1
        }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative" style={{ zIndex: 2 }}>
        <div className="text-center mb-16">
          <h2 className="text-[64px] md:text-[80px] lg:text-[96px] font-bold leading-[0.95] tracking-[0.02em] text-brand-light mb-8" style={{fontFamily: 'Milker'}}>
            CDC
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
            <a href="/work-with-us" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Work With Us</a>
            <a href="/global-reach" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Global Reach</a>
            <a href="/proof-in-the-people" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Proof in the People</a>
            <a href="/candid-moments" className="block text-brand-light text-[20px] font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>Candid Moments</a>
          </div>
        </div>
        
        <div className="pt-8 border-t border-brand-light/20 text-center">
          <a href="#" className="text-[16px] text-brand-light/60 font-semibold hover:text-brand-red transition-colors" style={{fontFamily: 'Milker'}}>
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
