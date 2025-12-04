import React from 'react';
import RotatingEarth, { EarthPin } from './RotatingEarth';

// Example locations data
const locations: EarthPin[] = [
  { 
    id: 'harrogate', 
    name: 'Harrogate', 
    lat: 53.9921, 
    lon: -1.5418, 
    image: '/411882-Harrogate.jpg', 
    description: 'After years in the industry, we\'d grown frustrated with the transactional, impersonal approach so common in recruitment. We wanted to build something different — a business rooted in honesty, personal connection, and genuine partnership.' 
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

export default function GlobeExample() {
  const handlePinSelect = (pinId: string) => {
    console.log('Selected pin:', pinId);
    // You can add custom logic here, like:
    // - Scroll to a section
    // - Update other UI elements
    // - Fetch additional data
    // - Track analytics
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      backgroundColor: '#FF914D' // Match the globe's ocean color
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        fontSize: '4rem', 
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: 'white'
      }}>
        Global Reach
      </h1>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        marginBottom: '4rem'
      }}>
        <RotatingEarth
          width={1600}
          height={900}
          className="max-w-[1600px] w-full"
          pins={locations}
          onSelectPin={handlePinSelect}
        />
      </div>
    </div>
  );
}

