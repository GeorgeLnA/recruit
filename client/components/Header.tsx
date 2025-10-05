import { ArrowRight } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed left-0 top-0 h-full w-20 hover:w-80 bg-brand-orange flex flex-col transition-all duration-300 ease-in-out group peer" style={{zIndex: 2147483648}}>
      {/* Logo */}
      <div className="header-logo-outline">
        <div className="header-logo-corner-bl"></div>
        <div className="header-logo-corner-br"></div>
        <div className="header-logo-inner p-2 group-hover:p-8 flex items-center justify-center transition-all duration-300">
        <a href="/" className="flex items-center justify-center">
          <div className="hidden group-hover:block text-white transition-all duration-300" style={{fontFamily: 'Milker', fontSize: '1.5rem'}}>
            RECRUIT
          </div>
        </a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav-outline flex-1">
        <div className="header-nav-corner-tr"></div>
        <div className="header-nav-corner-br"></div>
        <div className="header-nav-inner p-4 group-hover:p-8 space-y-4 group-hover:space-y-6 h-full flex flex-col justify-center transition-all duration-300">
        
        {/* Vertical text for collapsed state */}
        <div className="group-hover:hidden flex justify-center items-center h-full">
          <div className="text-lg font-bold transform rotate-180" style={{fontFamily: 'Milker', writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.3em', color: '#FFB366'}}>
            HOVER OVER ME!
          </div>
        </div>

        {/* Navigation buttons - hidden in collapsed state */}
        <div className="hidden group-hover:flex flex-col space-y-6 w-full">
        <a
          href="#expertises"
          className="group/nav flex items-center justify-start gap-4 px-6 py-4 text-xl font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105"
        >
          <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{backgroundColor: '#ff3a34'}}></div>
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-xl font-bold" style={{fontFamily: 'Milker'}}>Expertises</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" />
          </div>
        </a>
        <a
          href="#work"
          className="group/nav flex items-center justify-start gap-4 px-6 py-4 text-xl font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105"
        >
          <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{backgroundColor: '#ff3a34'}}></div>
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-xl font-bold" style={{fontFamily: 'Milker'}}>Work</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" />
          </div>
        </a>
        <a
          href="#about"
          className="group/nav flex items-center justify-start gap-4 px-6 py-4 text-xl font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105"
        >
          <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{backgroundColor: '#ff3a34'}}></div>
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-xl font-bold" style={{fontFamily: 'Milker'}}>About</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" />
          </div>
        </a>
        <a
          href="#contact"
          className="group/nav flex items-center justify-start gap-4 px-6 py-4 text-xl font-bold text-white relative overflow-hidden rounded-xl transition-all duration-500 hover:scale-105"
        >
          <div className="absolute inset-0 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 rounded-xl" style={{backgroundColor: '#ff3a34'}}></div>
          <div className="relative z-10 flex items-center gap-4">
            <span className="text-xl font-bold" style={{fontFamily: 'Milker'}}>Contact</span>
            <ArrowRight className="w-5 h-5 opacity-0 group-hover/nav:opacity-100 transition-all duration-300 transform group-hover/nav:translate-x-1" />
          </div>
        </a>
        </div>
        </div>
      </nav>

      {/* CTA Button */}
      <div className="header-cta-outline">
        <div className="header-cta-corner-tl"></div>
        <div className="header-cta-corner-tr"></div>
        <div className="header-cta-inner p-2 group-hover:p-8 transition-all duration-300">
          {/* Red block for collapsed state */}
          <div 
            className="group-hover:hidden w-full h-full rounded-[11.25px] transition-all duration-300"
            style={{backgroundColor: '#ff3a34'}}
          ></div>
          
          {/* JOIN NOW button for expanded state */}
          <a
            href="#contact"
            className="hidden group-hover:inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[11.25px] text-white font-bold text-[15px] transition-all duration-300 w-full h-full relative overflow-hidden"
            style={{backgroundColor: '#ff3a34', fontFamily: 'Milker'}}
          >
            <span className="text-center relative z-10 transition-colors duration-300">JOIN</span>
          </a>
        </div>
      </div>
    </header>
  );
}
