import Footer from "@/components/Footer";
import { gsap, useGSAP } from "@/lib/gsap";
import RotatingEarth, { EarthPin } from "@/components/RotatingEarth";
import LifeSciencesIcons from "@/components/LifeSciencesIcons";

const locations: EarthPin[] = [
  { 
    id: 'harrogate', 
    name: 'Harrogate', 
    lat: 53.9921, 
    lon: -1.5418, 
    image: '/411882-Harrogate.jpg', 
    description: 'After years in the industry, we\'d grown frustrated with the transactional, impersonal approach so common in recruitment. We wanted to build something different — a business rooted in honesty, personal connection, and genuine partnership. At CDC, we go beyond screens and calls — we travel to meet our clients and candidates in person, taking the time to truly understand their goals, culture, and challenges. It\'s that personal touch that drives every relationship we build.' 
  },
  { 
    id: 'dubai', 
    name: 'Dubai', 
    lat: 25.2048, 
    lon: 55.2708, 
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop', 
    description: 'Dubai entity opened July 2025 to further support our global reach and expand our presence in the Middle Eastern life sciences market.' 
  },
  { 
    id: 'barcelona', 
    name: 'ESMO Barcelona', 
    lat: 41.3851, 
    lon: 2.1734, 
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop', 
    description: 'Europe\'s biggest oncology conference. We attend ESMO to connect with leading oncology professionals and stay at the forefront of cancer research and treatment innovations.' 
  },
  { 
    id: 'chicago', 
    name: 'ASCO Chicago', 
    lat: 41.8781, 
    lon: -87.6298, 
    image: '/7d5ac2254f021e67620d0ed38f6a4e79.jpeg', 
    description: 'The world\'s premier oncology conference. ASCO brings together the global oncology community to share research, innovations, and best practices in cancer care.' 
  },
  { 
    id: 'switzerland', 
    name: 'ESCMID Switzerland', 
    lat: 46.2044, 
    lon: 6.1432, 
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', 
    description: 'Europe\'s leading microbiology and infectious disease conference. ESCMID connects us with specialists working on the front lines of antimicrobial resistance and emerging pathogens.' 
  },
  { 
    id: 'newyork', 
    name: 'DCAT New York', 
    lat: 40.7128, 
    lon: -74.0060, 
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop', 
    description: 'Premier CDMO conference and networking event. DCAT connects pharmaceutical manufacturers with contract development and manufacturing organizations worldwide.' 
  },
  { 
    id: 'frankfurt', 
    name: 'CPHI Frankfurt', 
    lat: 50.1109, 
    lon: 8.6821, 
    image: '/fuer_gallerydomblick_frankfurtdavid_vasicek.jpg', 
    description: 'Europe\'s biggest CDMO conference. CPHI Frankfurt is the global meeting point for pharmaceutical ingredients, manufacturing, and supply chain professionals.' 
  },
  { 
    id: 'sandiego', 
    name: 'BIO San Diego', 
    lat: 32.7157, 
    lon: -117.1611, 
    image: '/GTY-san-diego-jef-170407_16x9_992.jpg', 
    description: 'Top biologics conference in the USA. BIO San Diego showcases the latest in biotechnology innovation, from cell and gene therapy to precision medicine.' 
  },
  { 
    id: 'hyderabad', 
    name: 'Hyderabad', 
    lat: 17.3850, 
    lon: 78.4867, 
    image: '/2-charminar_hyderabad_telangana-1-city-hero.jpg', 
    description: 'Site visit to some of our biggest generic and small molecule customers. Hyderabad is a major hub for pharmaceutical manufacturing and research in India.' 
  },
  { 
    id: 'sydney', 
    name: 'Australia', 
    lat: -33.8688, 
    lon: 151.2093, 
    image: '/p0gp95cq.jpg', 
    description: 'Expanded our network of CROs with business trips to tour facilities in this region. Australia\'s CRO sector is growing rapidly with world-class clinical research capabilities.' 
  }
];

export default function GlobalReach() {
  const harrogateLocation = locations.find(loc => loc.id === 'harrogate');
  const otherLocations = locations.filter(loc => loc.id !== 'harrogate');
  
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
    
    // Animate Harrogate card separately
    gsap.set(".harrogate-card", { opacity: 0, y: 40 });
    gsap.to(".harrogate-card", { 
      y: 0, 
      opacity: 1, 
      duration: 0.6, 
      ease: 'power2.out',
      delay: 0.2
    });
  });

  return (
    <>
    <div className="min-h-screen pt-48 px-0 relative" style={{ backgroundColor: '#FF914D' }}>
      {/* Life Sciences Icons */}
      <LifeSciencesIcons count={12} side="both" size={70} />
        <div className="gr-hero text-center mb-16 relative" style={{ zIndex: 2 }}>
          <h1 className="text-8xl font-bold mb-16 text-center">Global Reach</h1>
        </div>
      <div className="w-full flex justify-center relative" style={{ zIndex: 2 }}>
        <RotatingEarth
          width={1600}
          height={900}
          className="max-w-[1600px] w-full"
          pins={locations}
        />
      </div>
      <div className="h-24" />
      
      {/* Locations Cards Section */}
      <div className="w-full px-4 md:px-8 lg:px-16 pb-32">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-7xl md:text-8xl font-bold mb-20 text-center">
            Our Locations
          </h2>
          
          {/* Harrogate Special Card */}
          {harrogateLocation && (
            <div className="harrogate-card mb-12 bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer" style={{ opacity: 1 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image on left */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                  <img
                    src={harrogateLocation.image}
                    alt={harrogateLocation.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    style={{ opacity: 1 }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <h3 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                      {harrogateLocation.name}
                    </h3>
                  </div>
                </div>
                
                {/* Description on right */}
                <div className="p-12 lg:p-16 bg-white flex items-center" style={{ opacity: 1 }}>
                  <p className="text-gray-800 leading-relaxed text-lg md:text-xl">
                    {harrogateLocation.description}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Other Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherLocations.map((location) => (
              <div
                key={location.id}
                className="location-card bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer"
                style={{ opacity: 1 }}
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
                  <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                      {location.name}
                    </h3>
                  </div>
                </div>
                
                <div className="p-8 bg-white" style={{ opacity: 1 }}>
                  <p className="text-gray-800 leading-relaxed text-base md:text-lg">
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

