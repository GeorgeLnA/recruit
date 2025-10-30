"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { gsap } from "@/lib/gsap";

export interface EarthPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  image?: string;
  description?: string;
}

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
  pins?: EarthPin[];
  onSelectPin?: (id: string) => void;
}

export default function RotatingEarth({ 
  width = 1200, 
  height = 800, 
  className = "", 
  pins = [], 
  onSelectPin 
}: RotatingEarthProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRefs = useRef<Record<string, HTMLDivElement>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement>>({});
  const pulseRefs = useRef<Record<string, HTMLSpanElement>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const autoRotateRef = useRef<boolean>(true);
  const renderRef = useRef<() => void>();
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const rotationRef = useRef<[number, number]>([0, 0]);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const landFeaturesRef = useRef<any>(null);
  const pinPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const positionUpdateRafRef = useRef<number | null>(null);

  // Update pin positions directly via DOM (no React re-renders)
  const updatePinPositions = useCallback(() => {
    if (!projectionRef.current) return;

    const projection = projectionRef.current;
    const rotation = rotationRef.current;
    const center: [number, number] = [-rotation[0], -rotation[1]];

    pins.forEach((pin) => {
      const pinEl = pinRefs.current[pin.id];
      if (!pinEl) return;

      const projected = projection([pin.lon, pin.lat]);
      if (!projected) {
        pinEl.style.display = 'none';
        return;
      }

      // Check visibility against horizon
      const distance = d3.geoDistance([pin.lon, pin.lat], center as [number, number]);
      const isVisible = distance <= Math.PI / 2;

      if (!isVisible) {
        pinEl.style.display = 'none';
        return;
      }

      pinEl.style.display = 'block';
      
      // Use sub-pixel precision during auto-rotation for smoother movement
      const x = autoRotateRef.current && !isDraggingRef.current 
        ? projected[0] 
        : Math.round(projected[0]);
      const y = autoRotateRef.current && !isDraggingRef.current 
        ? projected[1] 
        : Math.round(projected[1]);
      
      // Use transform for positioning (avoids layout recalculation, GPU accelerated)
      pinPositionsRef.current[pin.id] = { x, y };
      pinEl.style.left = '0px';
      pinEl.style.top = '0px';
      pinEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)`;
    });
  }, [pins]);

  // Render globe
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !projectionRef.current) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const containerWidth = Math.min(width, window.innerWidth - 40);
    const containerHeight = Math.min(height, window.innerHeight - 120);
    const radius = Math.min(containerWidth, containerHeight) / 2.1;

    // Update projection scale and translate if dimensions changed
    const projection = projectionRef.current;
    const currentScale = projection.scale();
    if (Math.abs(currentScale - radius) > 1) {
      projection.scale(radius);
      projection.translate([containerWidth / 2, containerHeight / 2]);
    }

      context.clearRect(0, 0, containerWidth, containerHeight);

    const scaleFactor = radius / Math.min(containerWidth, containerHeight) * 2.1;

      // Ocean background (peach) + white outline
      context.beginPath();
    context.arc(containerWidth / 2, containerHeight / 2, radius, 0, 2 * Math.PI);
      context.fillStyle = "#FF914D";
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2 * scaleFactor;
      context.stroke();

    const path = d3.geoPath().projection(projection).context(context as any);

    // Render land features if loaded
    if (landFeaturesRef.current) {
        // Graticule
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1 * scaleFactor;
        context.globalAlpha = 0.25;
        context.stroke();
        context.globalAlpha = 1;

        // Land filled white
      landFeaturesRef.current.features.forEach((feature: any) => {
          context.beginPath();
          path(feature);
          context.fillStyle = "#ffffff";
          context.fill();
          context.strokeStyle = "#ffffff";
          context.lineWidth = 1 * scaleFactor;
          context.stroke();
        });
    }

    updatePinPositions();
  }, [width, height, updatePinPositions]);

  // Initialize globe
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const containerWidth = Math.min(width, window.innerWidth - 40);
    const containerHeight = Math.min(height, window.innerHeight - 120);
    const radius = Math.min(containerWidth, containerHeight) / 2.1;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(dpr, dpr);

    // Create projection
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);
    
    projectionRef.current = projection;

    // Load world data
    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json"
        );
        if (!response.ok) throw new Error("Failed to load land data");

        const landFeatures = await response.json();
        landFeaturesRef.current = landFeatures;

        render();
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load Earth data");
        setIsLoading(false);
      }
    };

    loadWorldData();

    // Rotation animation
    const rotationSpeed = 0.08;

    const animate = () => {
      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current[0] += rotationSpeed;
        projection.rotate(rotationRef.current as any);
        
        // Render canvas first
        render();
        
        // Update positions in next frame to batch DOM updates
        if (positionUpdateRafRef.current === null) {
          positionUpdateRafRef.current = requestAnimationFrame(() => {
            updatePinPositions();
            positionUpdateRafRef.current = null;
          });
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);

    // Mouse interaction
    const handleMouseDown = (event: MouseEvent) => {
      // Don't start drag if clicking on a pin
      if ((event.target as HTMLElement).closest('.pin-button')) {
        return;
      }

      setSelectedId(null);
      autoRotateRef.current = false;
      isDraggingRef.current = true;
      
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation = [...rotationRef.current] as [number, number];
      
      let rafId: number | null = null;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotationRef.current[0] = startRotation[0] + dx * sensitivity;
        rotationRef.current[1] = startRotation[1] - dy * sensitivity;
        rotationRef.current[1] = Math.max(-90, Math.min(90, rotationRef.current[1]));

        projection.rotate(rotationRef.current as any);
        
        // Throttle renders using requestAnimationFrame
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
        render();
            updatePinPositions();
            rafId = null;
          });
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        isDraggingRef.current = false;
        // Final render to ensure positions are updated
        render();
        updatePinPositions();
        setTimeout(() => {
          autoRotateRef.current = true;
        }, 200);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    canvas.addEventListener("mousedown", handleMouseDown as any);

    renderRef.current = render;

    // Handle window resize
    const handleResize = () => {
      if (!canvas || !projectionRef.current) return;
      
      const containerWidth = Math.min(width, window.innerWidth - 40);
      const containerHeight = Math.min(height, window.innerHeight - 120);
      const radius = Math.min(containerWidth, containerHeight) / 2.1;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = containerWidth * dpr;
      canvas.height = containerHeight * dpr;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(dpr, dpr);
      }
      
      // Update projection
      projectionRef.current.scale(radius);
      projectionRef.current.translate([containerWidth / 2, containerHeight / 2]);
      
      // Re-render
      render();
      updatePinPositions();
    };

    window.addEventListener("resize", handleResize);
    // Initial resize to ensure correct sizing
    handleResize();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (positionUpdateRafRef.current) {
        cancelAnimationFrame(positionUpdateRafRef.current);
      }
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown as any);
    };
  }, [width, height, render]);

  // Handle pin selection with animation
  const handlePinClick = useCallback((pinId: string) => {
    const prevSelected = selectedId;
    const willSelect = pinId !== prevSelected;
    
    if (willSelect) {
      autoRotateRef.current = false;
      
      // Close previous card immediately
      if (prevSelected) {
        const prevCardEl = cardRefs.current[prevSelected];
        if (prevCardEl) {
          gsap.to(prevCardEl, {
            opacity: 0,
            y: 20,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setSelectedId(null);
            }
          });
        } else {
          setSelectedId(null);
        }
      }
      
      // Find the pin data
      const pin = pins.find(p => p.id === pinId);
      if (!pin) return;
      
      // Calculate target rotation to center the pin
      // To center a point at [lon, lat], we rotate by [-lon, -lat]
      const targetRotation: [number, number] = [-pin.lon, -pin.lat];
      const startRotation: [number, number] = [...rotationRef.current];
      
      // Animate rotation
      const rotationObj = { 
        lon: startRotation[0], 
        lat: startRotation[1] 
      };
      
      gsap.to(rotationObj, {
        lon: targetRotation[0],
        lat: Math.max(-90, Math.min(90, targetRotation[1])),
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: () => {
          rotationRef.current[0] = rotationObj.lon;
          rotationRef.current[1] = Math.max(-90, Math.min(90, rotationObj.lat));
          
          if (projectionRef.current) {
            projectionRef.current.rotate(rotationRef.current as any);
          }
          
          if (renderRef.current) {
            renderRef.current();
          }
        },
        onComplete: () => {
          // Open new card after rotation completes
          setSelectedId(pinId);
          onSelectPin?.(pinId);
        }
      });
    } else {
      // Deselect
      const cardEl = cardRefs.current[pinId];
      if (cardEl) {
        gsap.to(cardEl, {
          opacity: 0,
          y: 20,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setSelectedId(null);
          }
        });
      } else {
        setSelectedId(null);
      }
    }
  }, [selectedId, pins, onSelectPin]);

  if (error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-white text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-auto"
        style={{ 
          maxWidth: "100%", 
          height: "auto",
          display: "block"
        }} 
      />
      
      {/* Pins overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {pins.map((pin) => {
          return (
            <div
              key={pin.id}
              ref={(el) => {
                if (el) {
                  pinRefs.current[pin.id] = el;
                  // Initialize position on mount
                  if (projectionRef.current) {
                    const projected = projectionRef.current([pin.lon, pin.lat]);
                    if (projected) {
                      const x = Math.round(projected[0]);
                      const y = Math.round(projected[1]);
                      el.style.left = '0px';
                      el.style.top = '0px';
                      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 0)`;
                      el.style.display = 'block';
                    } else {
                      el.style.display = 'none';
                    }
                  }
                }
              }}
              className="absolute pointer-events-auto"
              style={{
                left: '0px',
                top: '0px',
                zIndex: selectedId === pin.id ? 1000 : 100,
                willChange: 'transform',
                display: 'none',
              }}
            >
              {/* Pin button - stays at exact position */}
              <button
                onClick={() => handlePinClick(pin.id)}
                className="pin-button relative flex items-center group -translate-y-1/2"
                aria-label={`Select ${pin.name}`}
              >
                {/* Pin dot container */}
                <div className="relative w-6 h-6">
                  {/* Pulsing ring */}
                  <span 
                    ref={(el) => {
                      if (el) {
                        // Kill any existing animation first
                        if (pulseRefs.current[pin.id]) {
                          gsap.killTweensOf(pulseRefs.current[pin.id]);
                        }
                        pulseRefs.current[pin.id] = el;
                        // Setup animation when element is mounted
                        gsap.set(el, { scale: 1, opacity: 0.3 });
                        gsap.to(el, {
                          scale: 1.3,
                          opacity: 0,
                          duration: 2.5,
                          repeat: -1,
                          ease: "power2.out"
                        });
                      }
                    }}
                    className="absolute top-0 left-0 w-6 h-6 rounded-full bg-[#ff3a34] opacity-30"
                    style={{ transformOrigin: 'center center' }}
                  />
                  
                  {/* Pin dot */}
                  <span
                    className={`absolute top-0 left-0 w-6 h-6 rounded-full shadow-lg transition-all duration-300 ${
                      selectedId === pin.id 
                        ? 'bg-[#ff3a34] ring-4 ring-[#ff3a34]/30 scale-125' 
                        : 'bg-[#ff3a34] ring-2 ring-white/70 hover:scale-110'
                    }`}
                    style={{ transformOrigin: 'center center' }}
                  />
                </div>
                
                {/* Pin label - positioned absolutely to the right */}
                <div className="absolute left-full ml-2 px-2 py-0.5 rounded text-xs font-semibold text-white/90 bg-black/50 whitespace-nowrap transition-opacity duration-300" style={{ fontFamily: "Milker" }}>
                  {pin.name}
                </div>
              </button>

              {/* Card - positioned below pin */}
              {selectedId === pin.id && (
                <div
                  ref={(el) => {
                    if (el) {
                      cardRefs.current[pin.id] = el;
                      // Set initial styles before animation
                      gsap.set(el, { opacity: 0, y: 20, scale: 0.9 });
                      // Then animate
                      requestAnimationFrame(() => {
                        gsap.to(el, {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      });
                    }
                  }}
                  className="absolute left-1/2 w-[600px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
                  style={{ 
                    transformOrigin: 'center top',
                    transform: 'translateX(-50%) translateY(20px) scale(0.9)',
                    opacity: 0,
                    top: 'calc(50% + 2rem)'
                  }}
                >
                  {pin.image && (
                    <img 
                      src={pin.image} 
                      alt={pin.name} 
                      className="w-full h-64 object-cover" 
                    />
                  )}
                  <div className="p-8">
                    <div className="text-3xl font-bold mb-4 text-gray-900" style={{ fontFamily: "Milker" }}>
                      {pin.name}
                    </div>
                    {pin.description && (
                      <p className="text-lg text-gray-700 leading-relaxed">{pin.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )}
    </div>
  );
}
