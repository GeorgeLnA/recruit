import Footer from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/gsap";
import RotatingEarth, { EarthPin } from "@/components/RotatingEarth";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const locations: EarthPin[] = [
  { 
    id: 'harrogate', 
    name: 'Harrogate', 
    lat: 53.9921, 
    lon: -1.5418, 
    image: '/411882-Harrogate.jpg', 
    description: 'This is where it all began. Harrogate is where we started our journey, building the foundation of CDC from the ground up. It\'s the place where our vision first took shape and where we learned the importance of personal connections in recruitment.',
    labelPosition: 'left'
  },
  { 
    id: 'dubai', 
    name: 'Dubai', 
    lat: 25.2048, 
    lon: 55.2708, 
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    video: '/vids/DUBAI.webm',
    description: 'After years in the industry, we\'d grown frustrated with the transactional, impersonal approach so common in recruitment. We wanted to build something different — a business rooted in honesty, personal connection, and genuine partnership. At CDC, we go beyond screens and calls — we travel to meet our clients and candidates in person, taking the time to truly understand their goals, culture, and challenges. It\'s that personal touch that drives every relationship we build.',
    labelPosition: 'top'
  },
  { 
    id: 'barcelona', 
    name: 'ESCMID Barcelona', 
    lat: 41.3851, 
    lon: 2.1734, 
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop', 
    description: 'Europe\'s leading microbiology and infectious disease conference. ESCMID connects us with specialists working on the front lines of antimicrobial resistance and emerging pathogens.',
    labelPosition: 'right'
  },
  { 
    id: 'berlin', 
    name: 'ESMO Berlin', 
    lat: 52.5200, 
    lon: 13.4050, 
    image: '/loc/00-holding-48-hours-in-berlin.webp', 
    description: 'Europe\'s biggest oncology conference. We attend ESMO to connect with leading oncology professionals and stay at the forefront of cancer research and treatment innovations.',
    labelPosition: 'top'
  },
  { 
    id: 'chicago', 
    name: 'ASCO Chicago', 
    lat: 41.8781, 
    lon: -87.6298, 
    image: '/7d5ac2254f021e67620d0ed38f6a4e79.jpeg', 
    description: 'The world\'s premier oncology conference. ASCO brings together the global oncology community to share research, innovations, and best practices in cancer care.',
    labelPosition: 'left'
  },
  { 
    id: 'newyork', 
    name: 'DCAT New York', 
    lat: 40.7128, 
    lon: -74.0060, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop', 
    description: 'Premier CDMO conference and networking event. DCAT connects pharmaceutical manufacturers with contract development and manufacturing organizations worldwide.',
    labelPosition: 'right'
  },
  { 
    id: 'frankfurt', 
    name: 'CPHI Frankfurt', 
    lat: 50.1109, 
    lon: 8.6821, 
    image: '/fuer_gallerydomblick_frankfurtdavid_vasicek.jpg', 
    description: 'Europe\'s biggest CDMO conference. CPHI Frankfurt is the global meeting point for pharmaceutical ingredients, manufacturing, and supply chain professionals.',
    labelPosition: 'right'
  },
  { 
    id: 'sandiego', 
    name: 'BIO San Diego', 
    lat: 32.7157, 
    lon: -117.1611, 
    image: '/GTY-san-diego-jef-170407_16x9_992.jpg', 
    description: 'Top biologics conference in the USA. BIO San Diego showcases the latest in biotechnology innovation, from cell and gene therapy to precision medicine.',
    labelPosition: 'left'
  },
  { 
    id: 'hyderabad', 
    name: 'Hyderabad', 
    lat: 17.3850, 
    lon: 78.4867, 
    image: '/2-charminar_hyderabad_telangana-1-city-hero.jpg', 
    description: 'Site visit to some of our biggest generic and small molecule customers. Hyderabad is a major hub for pharmaceutical manufacturing and research in India.',
    labelPosition: 'top'
  },
  { 
    id: 'sydney', 
    name: 'Australia', 
    lat: -33.8688, 
    lon: 151.2093, 
    image: '/p0gp95cq.jpg', 
    description: 'Expanded our network of CROs with business trips to tour facilities in this region. Australia\'s CRO sector is growing rapidly with world-class clinical research capabilities.',
    labelPosition: 'top'
  },
  { 
    id: 'boston', 
    name: 'BIO Boston', 
    lat: 42.3601, 
    lon: -71.0589, 
    image: '/loc/de6f732d8950b74b550d885beab53c37.jpeg', 
    description: 'Premier biotechnology conference showcasing the latest innovations in life sciences. BIO Boston brings together industry leaders, researchers, and innovators driving the future of biotech.',
    labelPosition: 'top'
  },
  { 
    id: 'newjersey', 
    name: 'Chem Outsourcing New Jersey', 
    lat: 39.5, 
    lon: -74.1724, 
    image: '/loc/151712-Liberty-State-Park.webp', 
    description: 'Key chemical outsourcing and CDMO conference connecting pharmaceutical companies with contract manufacturing partners. This event is essential for building strategic partnerships in chemical development and manufacturing.',
    labelPosition: 'bottom'
  },
  { 
    id: 'sanfrancisco', 
    name: 'JP Morgan San Francisco', 
    lat: 37.7749, 
    lon: -122.4194, 
    image: '/loc/cruise-to-san-francisco-usa.webp', 
    description: 'The premier healthcare investment conference bringing together biotech and pharma companies with investors. JP Morgan Healthcare Conference is where industry leaders connect with capital markets and strategic partners.',
    labelPosition: 'top'
  },
  { 
    id: 'medlab-dubai', 
    name: 'MEDLAB Dubai', 
    lat: 25.2048, 
    lon: 55.2708, 
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    video: '/vids/DUBAI.webm',
    description: 'Middle East\'s leading medical laboratory exhibition and conference. MEDLAB Dubai connects us with laboratory professionals, diagnostic companies, and healthcare innovators across the region.',
    labelPosition: 'top'
  },
  { 
    id: 'arizona', 
    name: 'Meeting on the Mesa Arizona', 
    lat: 33.4484, 
    lon: -112.0740, 
    image: '/loc/blog-ratgeber-usa-arizona-sonnenuntergang-felsen-natucate.webp', 
    description: 'Premier biotech and life sciences conference in the Southwest. Meeting on the Mesa brings together industry leaders, researchers, and entrepreneurs to discuss the latest advances in biotechnology and pharmaceutical innovation.',
    labelPosition: 'bottom'
  }
];

export default function GlobalReach() {
  const dubaiLocation = locations.find(loc => loc.id === 'dubai');
  // Filter out locations that should only appear on globe (not as cards)
  const globeOnlyIds = ['boston', 'newjersey', 'sanfrancisco', 'medlab-dubai', 'arizona', 'berlin'];
  const otherLocations = locations.filter(loc => loc.id !== 'dubai' && !globeOnlyIds.includes(loc.id));
  
  // Dubai video sound control
  const dubaiVideoRef = useRef<HTMLVideoElement>(null);
  const dubaiCardRef = useRef<HTMLDivElement>(null);
  const [isDubaiSoundEnabled, setIsDubaiSoundEnabled] = useState(false);

  // Set Dubai video thumbnail to 0.1 seconds
  useEffect(() => {
    const video = dubaiVideoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      video.currentTime = 0.1;
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    if (video.readyState >= 1) {
      video.currentTime = 0.1;
    }
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useGSAP(() => {
    gsap.from(".gr-hero", { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from(".gr-globe", { y: 40, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.1 });
    gsap.from(".gr-panel", { x: 30, opacity: 0, duration: 0.7, ease: 'power2.out', delay: 0.15 });
    
    // Set initial state and animate to full opacity
    gsap.set(".location-card", { opacity: 0, y: 40 });
    gsap.to(".location-card", { 
      y: 0, 
      opacity: 1, 
      duration: 0.6, 
      ease: 'power2.out',
      stagger: 0.1
    });
    
    // Animate Dubai card separately
    gsap.set(".dubai-card", { opacity: 0, y: 40 });
    gsap.to(".dubai-card", { 
      y: 0, 
      opacity: 1, 
      duration: 0.6, 
      ease: 'power2.out',
      delay: 0.2
    });
  });

  return (
    <>
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--color-peach)', paddingTop: 'clamp(120px, 12vw, 192px)' }}>
        <div className="gr-hero text-center relative" style={{ zIndex: 2, marginBottom: 'clamp(40px, 4vw, 64px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}>
          <h1 className="font-bold text-center" style={{ fontSize: 'clamp(48px, 6vw, 96px)', marginBottom: 'clamp(40px, 4vw, 64px)' }}>Global Reach</h1>
        </div>
      <div className="w-full relative" style={{ zIndex: 2, minHeight: 'clamp(400px, 50vh, 600px)', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: 'clamp(20px, 2vw, 40px)', paddingRight: 'clamp(20px, 2vw, 40px)' }}>
        <div style={{ width: '100%', maxWidth: 'clamp(1200px, 90vw, 1600px)', margin: '0 auto', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <RotatingEarth
            width={1600}
            height={900}
            className="w-full"
            pins={locations}
          />
        </div>
      </div>
      <div style={{ height: 'clamp(48px, 4vw, 96px)' }} />
      
      {/* Locations Cards Section */}
      <div className="w-full" style={{ paddingBottom: 'clamp(80px, 8vw, 128px)', paddingLeft: 'clamp(24px, 3vw, 48px)', paddingRight: 'clamp(24px, 3vw, 48px)' }}>
        <div className="mx-auto" style={{ maxWidth: '1400px' }}>
          <h2 className="font-bold text-center" style={{ fontSize: 'clamp(40px, 5vw, 64px)', marginBottom: 'clamp(60px, 6vw, 80px)' }}>
            Our Locations
          </h2>
          
          {/* Dubai Special Card */}
          {dubaiLocation && (
            <div 
              ref={dubaiCardRef}
              className="dubai-card overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative" 
              style={{ opacity: 1, backgroundColor: '#FF9752', marginBottom: 'clamp(32px, 3vw, 48px)', borderRadius: 'clamp(24px, 2vw, 32px)' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 0 }}>
                {/* Video on left */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                  <video
                    ref={dubaiVideoRef}
                    src={dubaiLocation.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    loading="lazy"
                    disablePictureInPicture
                    disableRemotePlayback
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Mute/Unmute Toggle Button */}
                  <button
                    onClick={() => {
                      if (dubaiVideoRef.current) {
                        dubaiVideoRef.current.muted = !dubaiVideoRef.current.muted;
                        setIsDubaiSoundEnabled(!dubaiVideoRef.current.muted);
                      }
                    }}
                    className="absolute z-10 rounded-full transition-colors"
                    style={{ backgroundColor: '#FF9752', color: 'white', top: 'clamp(12px, 1vw, 16px)', right: 'clamp(12px, 1vw, 16px)', padding: 'clamp(8px, 0.75vw, 12px)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e6823a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF9752';
                    }}
                    aria-label={isDubaiSoundEnabled ? "Mute" : "Unmute"}
                  >
                    {isDubaiSoundEnabled ? (
                      <VolumeX className="text-white" style={{ width: 'clamp(16px, 1.25vw, 20px)', height: 'clamp(16px, 1.25vw, 20px)' }} />
                    ) : (
                      <Volume2 className="text-white" style={{ width: 'clamp(16px, 1.25vw, 20px)', height: 'clamp(16px, 1.25vw, 20px)' }} />
                    )}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute pointer-events-none" style={{ bottom: 'clamp(20px, 1.5vw, 24px)', left: 'clamp(20px, 1.5vw, 24px)', right: 'clamp(20px, 1.5vw, 24px)' }}>
                    <h3 className="font-bold drop-shadow-lg" style={{ color: '#FFF5E5', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(28px, 3vw, 40px)' }}>
                      {dubaiLocation.name}
                    </h3>
                  </div>
                </div>
                
                {/* Description on right */}
                <div className="flex items-center" style={{ opacity: 1, padding: 'clamp(32px, 3vw, 64px)' }}>
                  <p className="text-white leading-relaxed" style={{ fontSize: 'clamp(14px, 1.125vw, 20px)' }}>
                    {dubaiLocation.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Other Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'clamp(24px, 2vw, 32px)' }}>
            {otherLocations.map((location) => (
              <div
                key={location.id}
                className="location-card overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                style={{ backgroundColor: '#FF9752', opacity: 1, borderRadius: 'clamp(24px, 2vw, 32px)' }}
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{ opacity: 1 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute pointer-events-none" style={{ bottom: 'clamp(20px, 1.5vw, 24px)', left: 'clamp(20px, 1.5vw, 24px)', right: 'clamp(20px, 1.5vw, 24px)' }}>
                    <h3 className="font-bold drop-shadow-lg" style={{ color: '#FFF5E5', fontFamily: 'TexGyreAdventor', fontSize: 'clamp(24px, 2.5vw, 36px)' }}>
                      {location.name}
                    </h3>
                  </div>
                </div>
                
                <div style={{ opacity: 1, padding: 'clamp(24px, 2vw, 32px)' }}>
                  <p className="text-white leading-relaxed" style={{ fontSize: 'clamp(14px, 1vw, 18px)' }}>
                    {location.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

