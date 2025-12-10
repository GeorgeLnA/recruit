"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";

export interface EarthPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  image?: string;
  video?: string;
  description?: string;
  labelPosition?: 'top' | 'right' | 'bottom' | 'left';
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
  const [isHoveringGlobe, setIsHoveringGlobe] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [smoothedCursorPosition, setSmoothedCursorPosition] = useState({ x: 0, y: 0 });
  const dragLabelRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const cardContainerRefs = useRef<Record<string, HTMLDivElement>>({});
  const [isHoveringCard, setIsHoveringCard] = useState<Record<string, boolean>>({});
  const [isSoundEnabled, setIsSoundEnabled] = useState<Record<string, boolean>>({});
  
  // Simple mute toggle function
  const toggleMute = useCallback((pinId: string) => {
    const video = videoRefs.current[pinId];
    if (!video) return;
    
    const newMutedState = !video.muted;
    video.muted = newMutedState;
    setIsSoundEnabled(prev => ({
      ...prev,
      [pinId]: !newMutedState
    }));
    
    // If unmuting, ensure video plays (required for sound on mobile)
    if (!newMutedState) {
      video.play().catch((error) => {
        console.log('Video play prevented:', error);
        // If play fails, mute it back
        video.muted = true;
        setIsSoundEnabled(prev => ({
          ...prev,
          [pinId]: false
        }));
      });
    }
  }, []);
  const [cardCursorPosition, setCardCursorPosition] = useState<Record<string, { x: number; y: number }>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const isHoveringPinOrCard = useRef<Record<string, boolean>>({});
  const hoverTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  const autoRotateRef = useRef<boolean>(true);
  const renderRef = useRef<() => void>();
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const rotationRef = useRef<[number, number]>([0, -45]);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const landFeaturesRef = useRef<any>(null);
  const pinPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const positionUpdateRafRef = useRef<number | null>(null);
  const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartRotationRef = useRef<[number, number]>([0, -45]);
  const touchRafRef = useRef<number | null>(null);
  const isTouchDraggingRef = useRef<boolean>(false);

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
        // Only hide if not dragging to prevent flickering
        if (!isDraggingRef.current) {
          pinEl.style.display = 'none';
        }
        return;
      }

      // Check visibility against horizon
      const distance = d3.geoDistance([pin.lon, pin.lat], center as [number, number]);
      const isVisible = distance <= Math.PI / 2;

      // During dragging, keep pins visible to prevent blinking
      if (!isVisible && !isDraggingRef.current) {
        // Only hide if currently visible to avoid repeated animations
        if (pinEl.style.display !== 'none') {
          pinEl.style.opacity = '0';
          pinEl.style.transition = 'opacity 0.2s ease-out';
          setTimeout(() => {
            if (pinEl.style.opacity === '0') {
              pinEl.style.display = 'none';
            }
          }, 200);
        }
        return;
      }

      // Always show during drag, or if visible
      if (isDraggingRef.current || isVisible) {
        if (pinEl.style.display === 'none') {
          pinEl.style.display = 'block';
          pinEl.style.opacity = '0';
          pinEl.style.transition = 'opacity 0.2s ease-out';
          requestAnimationFrame(() => {
            pinEl.style.opacity = '1';
          });
        } else {
          pinEl.style.opacity = '1';
        }
      }
      
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

    const rootStyles = getComputedStyle(document.documentElement);
    const peachColor = rootStyles.getPropertyValue("--color-peach")?.trim() || "#FF914D";
    const whiteColor = rootStyles.getPropertyValue("--color-white")?.trim() || "#FFFFFF";
    const orangeColor = rootStyles.getPropertyValue("--color-blue")?.trim() || "#FF9752";

    // Ensure globe is always circular - use the smaller dimension to maintain perfect circle
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 120;
    const containerSize = Math.min(availableWidth, availableHeight, width, height);
    const containerWidth = containerSize;
    const containerHeight = containerSize;
    const radius = containerSize / 2.1;

    // Store canvas size for pin positioning
    canvasSizeRef.current = { width: containerWidth, height: containerHeight };
    setCanvasSize({ width: containerWidth, height: containerHeight });

    // Update projection scale and translate if dimensions changed
    const projection = projectionRef.current;
    const currentScale = projection.scale();
    if (Math.abs(currentScale - radius) > 1) {
      projection.scale(radius);
      projection.translate([containerWidth / 2, containerHeight / 2]);
    }

      context.clearRect(0, 0, containerWidth, containerHeight);

    const scaleFactor = radius / containerSize * 2.1;

      // Ocean background (peach)
      context.beginPath();
    context.arc(containerWidth / 2, containerHeight / 2, radius, 0, 2 * Math.PI);
      context.fillStyle = peachColor;
      context.fill();

    const path = d3.geoPath().projection(projection).context(context as any);

    // Render land features if loaded
    if (landFeaturesRef.current) {
        // Graticule
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule());
        context.strokeStyle = whiteColor;
        context.lineWidth = 1 * scaleFactor;
        context.globalAlpha = 0.25;
        context.stroke();
        context.globalAlpha = 1;

        // Land filled orange
      landFeaturesRef.current.features.forEach((feature: any) => {
          context.beginPath();
          path(feature);
          context.fillStyle = orangeColor;
          context.fill();
          context.strokeStyle = orangeColor;
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

    // Ensure globe is always circular - use the smaller dimension to maintain perfect circle
    const availableWidth = window.innerWidth - 40;
    const availableHeight = window.innerHeight - 120;
    const containerSize = Math.min(availableWidth, availableHeight, width, height);
    const containerWidth = containerSize;
    const containerHeight = containerSize;
    const radius = containerSize / 2.1;
    
    // Store canvas size for pin positioning
    canvasSizeRef.current = { width: containerWidth, height: containerHeight };
    setCanvasSize({ width: containerWidth, height: containerHeight });

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
    
    // Apply initial rotation with default -20 degree tilt
    projection.rotate(rotationRef.current as any);
    
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
      // Auto-rotate when enabled, not dragging, and no pin is selected
      if (autoRotateRef.current && !isDraggingRef.current && !selectedId) {
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

      // Close pin if open when starting to drag
      if (selectedId) {
        setSelectedId(null);
      }

      setIsHoveringGlobe(false);
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
        // Final render to ensure positions are updated
        render();
        updatePinPositions();
        // Delay setting isDragging to false to prevent blink
        setTimeout(() => {
          isDraggingRef.current = false;
          // Update positions again after delay to apply visibility checks
          updatePinPositions();
          autoRotateRef.current = true;
        }, 300);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    canvas.addEventListener("mousedown", handleMouseDown as any);
    
    // Note: Touch handlers are now handled via React event handlers on the canvas element
    // This provides better mobile support and prevents conflicts

    renderRef.current = render;

    // Handle window resize
    const handleResize = () => {
      if (!canvas || !projectionRef.current) return;
      
      // Ensure globe is always circular - use the smaller dimension to maintain perfect circle
      const availableWidth = window.innerWidth - 40;
      const availableHeight = window.innerHeight - 120;
      const containerSize = Math.min(availableWidth, availableHeight, width, height);
      const containerWidth = containerSize;
      const containerHeight = containerSize;
      const radius = containerSize / 2.1;
      
      // Store canvas size for pin positioning
      canvasSizeRef.current = { width: containerWidth, height: containerHeight };
      
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
      // Clean up hover timeouts
      Object.values(hoverTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown as any);
      // Touch handlers are React handlers, no cleanup needed
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
      // Add extra downward tilt (subtract from lat) to position dot higher on screen
      const extraTilt = -50; // degrees of additional downward tilt
      const targetRotation: [number, number] = [-pin.lon, -pin.lat - extraTilt];
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
          // Start video playback if it's a video pin
          const pin = pins.find(p => p.id === pinId);
          if (pin?.video) {
            setTimeout(() => {
              const video = videoRefs.current[pinId];
              if (video) {
                video.play().catch((error) => {
                  console.log('Video autoplay prevented:', error);
                });
              }
            }, 100);
          }
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
            // Resume auto-rotation on mobile after closing card
            if (isMobile) {
              setTimeout(() => {
                if (!isDraggingRef.current) {
                  autoRotateRef.current = true;
                }
              }, 1000);
            } else {
              autoRotateRef.current = true;
            }
          }
        });
      } else {
        setSelectedId(null);
        // Resume auto-rotation on mobile after closing card
        if (isMobile) {
          setTimeout(() => {
            if (!isDraggingRef.current) {
              autoRotateRef.current = true;
            }
          }, 1000);
        } else {
          autoRotateRef.current = true;
        }
      }
    }
  }, [selectedId, pins, onSelectPin, isMobile]);

  // Smooth cursor position with damping - disabled on mobile
  useEffect(() => {
    if (isMobile || !isHoveringGlobe || selectedId) {
      // Reset smoothed position when not hovering or on mobile
      setSmoothedCursorPosition(cursorPosition);
      return;
    }
    
    const damping = 0.2; // Lower = smoother, slower response
    let rafId: number | null = null;
    
    const animate = () => {
      setSmoothedCursorPosition(prev => ({
        x: prev.x + (cursorPosition.x - prev.x) * damping,
        y: prev.y + (cursorPosition.y - prev.y) * damping
      }));
      
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [cursorPosition, isHoveringGlobe, selectedId, isMobile]);

  // Fade in/out animation for drag label
  useEffect(() => {
    const label = dragLabelRef.current;
    if (!label) return;

    // Don't show drag label if a card is selected or hovering over pin/card
    const isHoveringPinOrCardAny = Object.values(isHoveringPinOrCard.current).some(v => v);
    
    if (isHoveringGlobe && !selectedId && !isHoveringPinOrCardAny) {
      label.style.display = 'block';
      gsap.killTweensOf(label);
      gsap.to(label, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.killTweensOf(label);
      gsap.to(label, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          if (label) {
            label.style.display = 'none';
          }
        }
      });
    }
  }, [isHoveringGlobe, selectedId]);

  // Ensure videos play when their cards become visible
  useEffect(() => {
    if (selectedId) {
      const pin = pins.find(p => p.id === selectedId);
      if (pin?.video) {
        const video = videoRefs.current[selectedId];
        if (video) {
          // Sync muted state with React state
          video.muted = isSoundEnabled[selectedId] === undefined ? true : !isSoundEnabled[selectedId];
          // Small delay to ensure card animation has started
          setTimeout(() => {
            video.play().catch((error) => {
              console.log('Video autoplay prevented:', error);
            });
          }, 350); // Slightly after card animation starts
        }
      }
    }
  }, [selectedId, pins, isSoundEnabled]);
  
  // Sync video muted state when isSoundEnabled changes
  useEffect(() => {
    pins.forEach((pin) => {
      if (pin.video) {
        const video = videoRefs.current[pin.id];
        if (video) {
          // Default to muted if state is undefined, otherwise use state
          const shouldBeMuted = isSoundEnabled[pin.id] === undefined ? true : !isSoundEnabled[pin.id];
          video.muted = shouldBeMuted;
        }
      }
    });
  }, [isSoundEnabled, pins]);

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

  // Close pin when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (selectedId) {
        const target = event.target as Node;
        // Check if click is outside the card and not on a pin button
        const cardEl = cardRefs.current[selectedId];
        const isClickOnPinButton = target instanceof Element && target.closest('.pin-button');
        const isClickOnCard = cardEl && cardEl.contains(target);
        
        if (!isClickOnCard && !isClickOnPinButton) {
          setSelectedId(null);
          // Resume auto-rotation when pin is closed - check mobile at runtime
          const isMobileDevice = window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
          if (isMobileDevice) {
            setTimeout(() => {
              if (!isDraggingRef.current) {
                autoRotateRef.current = true;
              }
            }, 1000);
          } else {
            autoRotateRef.current = true;
          }
        }
      }
    };

    if (selectedId) {
      // Add event listeners with a small delay to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedId]);

  // Update pin label colors on mobile when location is opened/closed
  useEffect(() => {
    if (!isMobile) return; // Only on mobile
    
    pins.forEach((pin) => {
      const pinEl = pinRefs.current[pin.id];
      if (!pinEl) return;
      
      const pinLabel = pinEl.querySelector('.pin-label') as HTMLElement;
      if (!pinLabel) return;
      
      if (selectedId === pin.id) {
        // Location is open - change to colored state
        gsap.to(pinLabel, {
          backgroundColor: '#464C53',
          color: '#FF9752',
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        // Location is closed - change back to white
        gsap.to(pinLabel, {
          backgroundColor: '#FFF5E5',
          color: '#464C53',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  }, [selectedId, pins, isMobile]);

  // React touch handlers for mobile - work on all devices but only process on mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement | HTMLDivElement>) => {
    // Check if mobile at runtime
    const isMobileDevice = window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isMobileDevice || !projectionRef.current) return;
    
    // Don't start drag if clicking on a pin or pin card
    const target = e.target as HTMLElement;
    if (target.closest('.pin-button') || target.closest('.pin-card')) {
      return;
    }

    // Close pin if open when starting to drag
    if (selectedId) {
      setSelectedId(null);
    }

    setIsHoveringGlobe(false);
    autoRotateRef.current = false;
    isDraggingRef.current = true;
    isTouchDraggingRef.current = true;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartRotationRef.current = [...rotationRef.current] as [number, number];
    
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement | HTMLDivElement>) => {
    // Check if mobile at runtime
    const isMobileDevice = window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isMobileDevice || !isTouchDraggingRef.current) return;
    
    const projection = projectionRef.current;
    if (!projection) return;
    if (e.touches.length === 0) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    const dx = Math.abs(touch.clientX - touchStartXRef.current);
    const dy = Math.abs(touch.clientY - touchStartYRef.current);
    
    // Always prevent default when dragging
    e.preventDefault();
    e.stopPropagation();
    
    // Only process if we've moved enough
    if (dx < 3 && dy < 3) {
      return; // Not enough movement yet
    }
    
    const sensitivity = 0.5;
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    rotationRef.current[0] = touchStartRotationRef.current[0] + deltaX * sensitivity;
    rotationRef.current[1] = touchStartRotationRef.current[1] - deltaY * sensitivity;
    rotationRef.current[1] = Math.max(-90, Math.min(90, rotationRef.current[1]));

    projection.rotate(rotationRef.current as any);
    
    // Throttle renders using requestAnimationFrame
    if (touchRafRef.current === null) {
      touchRafRef.current = requestAnimationFrame(() => {
        if (renderRef.current) {
          renderRef.current();
        }
        updatePinPositions();
        touchRafRef.current = null;
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement | HTMLDivElement>) => {
    // Check if mobile at runtime
    const isMobileDevice = window.innerWidth < 768 || ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (!isMobileDevice || !isTouchDraggingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (touchRafRef.current !== null) {
      cancelAnimationFrame(touchRafRef.current);
      touchRafRef.current = null;
    }
    
    // Final render to ensure positions are updated
    if (renderRef.current) {
      renderRef.current();
    }
    updatePinPositions();
    
    // Delay setting isDragging to false to prevent blink
    setTimeout(() => {
      isDraggingRef.current = false;
      isTouchDraggingRef.current = false;
      // Update positions again after delay to apply visibility checks
      updatePinPositions();
      // Resume auto-rotation on mobile after 1 second of no touch
      setTimeout(() => {
        if (!isDraggingRef.current && !selectedId) {
          autoRotateRef.current = true;
        }
      }, 1000);
    }, 300);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`} 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: '0 auto',
        touchAction: isMobile ? 'none' : 'auto'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%',
          aspectRatio: '1 / 1',
          maxWidth: '100%',
          height: 'auto',
          display: "block",
          margin: '0 auto',
          touchAction: isMobile ? 'none' : 'auto',
          pointerEvents: 'auto',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseEnter={() => {
          if (!isMobile) {
            // Don't set hovering globe if a card is selected or hovering over pin/card
            if (!selectedId && !Object.values(isHoveringPinOrCard.current).some(v => v)) {
              setIsHoveringGlobe(true);
            }
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            // Don't reset hovering globe if a card is selected or hovering over pin/card
            if (!selectedId && !Object.values(isHoveringPinOrCard.current).some(v => v)) {
              setIsHoveringGlobe(false);
            }
          }
        }}
        onMouseMove={(e) => {
          if (!isMobile) {
            setCursorPosition({
              x: e.clientX,
              y: e.clientY
            });
          }
        }}
      />
      
      {/* Drag label that follows cursor - hidden on mobile */}
      {!isMobile && (
        <div
          ref={dragLabelRef}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${smoothedCursorPosition.x + 8}px`,
            top: `${smoothedCursorPosition.y + 8}px`,
          transform: 'translate(0, 0)',
          backgroundColor: '#464C53',
          color: '#FF9752',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontFamily: 'TexGyreAdventor',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          opacity: 0,
          display: 'none'
        }}
      >
        Drag to rotate
      </div>
      )}
      
      {/* Pins overlay - positioned to match canvas exactly */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          margin: '0 auto'
        }}
      >
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
                onMouseEnter={(e) => {
                  if (isMobile) return; // Skip hover effects on mobile
                  
                  // Mark that we're hovering over pin or card
                  if (hoverTimeoutRef.current[pin.id]) {
                    clearTimeout(hoverTimeoutRef.current[pin.id]);
                    delete hoverTimeoutRef.current[pin.id];
                  }
                  isHoveringPinOrCard.current[pin.id] = true;
                  // Prevent drag label from showing when hovering over pin/card
                  setIsHoveringGlobe(false);
                  
                  // Keep card visible when hovering pin
                  if (selectedId === pin.id) {
                    return;
                  }
                  if (selectedId !== pin.id) {
                    const pinDot = e.currentTarget.querySelector('.pin-dot') as HTMLElement;
                    const pinLabel = e.currentTarget.querySelector('.pin-label') as HTMLElement;
                    if (pinDot) {
                      gsap.to(pinDot, {
                        scale: 1.5,
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                    if (pinLabel) {
                      gsap.to(pinLabel, {
                        scale: 1.2,
                        backgroundColor: '#464C53',
                        color: '#FF9752',
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (isMobile) return; // Skip hover effects on mobile
                  
                  // Add delay before marking as not hovering to prevent flicker
                  isHoveringPinOrCard.current[pin.id] = false;
                  hoverTimeoutRef.current[pin.id] = setTimeout(() => {
                    // Only allow globe hover state to change if not hovering over any pin/card
                    if (!isHoveringPinOrCard.current[pin.id] && 
                        !Object.values(isHoveringPinOrCard.current).some(v => v) &&
                        !selectedId) {
                      // Can safely reset globe hover state
                    }
                  }, 150);
                  
                  if (selectedId !== pin.id) {
                    const pinDot = e.currentTarget.querySelector('.pin-dot') as HTMLElement;
                    const pinLabel = e.currentTarget.querySelector('.pin-label') as HTMLElement;
                    if (pinDot) {
                      gsap.to(pinDot, {
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                    if (pinLabel) {
                      gsap.to(pinLabel, {
                        scale: 1,
                        backgroundColor: '#FFF5E5',
                        color: '#464C53',
                        duration: 0.3,
                        ease: 'power2.out'
                      });
                    }
                  }
                }}
              >
                {/* Pin dot container */}
                <div className="relative w-4 h-4">
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
                    className="absolute top-0 left-0 w-4 h-4 rounded-full opacity-30"
                    style={{ backgroundColor: '#464C53', transformOrigin: 'center center' }}
                  />
                  
                  {/* Pin dot */}
                  <span
                    className={`pin-dot absolute top-0 left-0 w-4 h-4 rounded-full shadow-lg ${
                      selectedId === pin.id ? 'scale-125' : ''
                    }`}
                    style={{ backgroundColor: '#464C53', transformOrigin: 'center center' }}
                  />
                </div>
                
                {/* Pin label - positioned based on labelPosition prop */}
                <div 
                  className={cn(
                    "pin-label absolute px-2 py-0.5 rounded font-semibold whitespace-nowrap",
                    isMobile ? "text-[10px]" : "text-xs",
                    {
                      'bottom-full mb-2 left-1/2 -translate-x-1/2': pin.labelPosition === 'top' || !pin.labelPosition,
                      'left-full ml-2 top-1/2 -translate-y-1/2': pin.labelPosition === 'right',
                      'top-full mt-2 left-1/2 -translate-x-1/2': pin.labelPosition === 'bottom',
                      'right-full mr-2 top-1/2 -translate-y-1/2': pin.labelPosition === 'left',
                    }
                  )}
                  style={{ 
                    fontFamily: "TexGyreAdventor", 
                    backgroundColor: '#FFF5E5', 
                    color: '#464C53',
                    transformOrigin: 'center center'
                  }}
                >
                  {pin.name}
                </div>
              </button>

              {/* Card - positioned below pin */}
              {selectedId === pin.id && (
                <div
                  ref={(el) => {
                    if (el && !cardRefs.current[pin.id]) {
                      // Only animate on first mount, not on re-renders
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
                    } else if (el) {
                      // On subsequent renders, just update the ref without re-animating
                      cardRefs.current[pin.id] = el;
                    }
                  }}
                  className="absolute rounded-xl shadow-xl overflow-hidden pin-card"
                  style={{ 
                    width: isMobile ? 'clamp(280px, 85vw, 400px)' : '600px',
                    transformOrigin: 'center top',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: 'calc(50% + 12px)',
                    backgroundColor: '#FF9752',
                    pointerEvents: 'auto'
                  }}
                  onMouseEnter={() => {
                    // Mark that we're hovering over pin or card
                    if (hoverTimeoutRef.current[pin.id]) {
                      clearTimeout(hoverTimeoutRef.current[pin.id]);
                      delete hoverTimeoutRef.current[pin.id];
                    }
                    isHoveringPinOrCard.current[pin.id] = true;
                    // Prevent drag label from showing when hovering over card
                    setIsHoveringGlobe(false);
                  }}
                  onMouseLeave={() => {
                    // Add delay before marking as not hovering to prevent flicker
                    isHoveringPinOrCard.current[pin.id] = false;
                    hoverTimeoutRef.current[pin.id] = setTimeout(() => {
                      // Only allow globe hover state to change if not hovering over any pin/card
                      if (!isHoveringPinOrCard.current[pin.id] && 
                          !Object.values(isHoveringPinOrCard.current).some(v => v) &&
                          !selectedId) {
                        // Can safely reset globe hover state
                      }
                    }, 150);
                  }}
                >
                  {pin.video ? (
                    <div 
                      ref={(el) => {
                        if (el && pin.id) {
                          cardContainerRefs.current[pin.id] = el;
                        }
                      }}
                      className="relative w-full cursor-pointer overflow-hidden"
                      style={{ height: isMobile ? 'clamp(160px, 40vw, 200px)' : '256px' }}
                      onMouseEnter={() => setIsHoveringCard(prev => ({ ...prev, [pin.id]: true }))}
                      onMouseLeave={() => setIsHoveringCard(prev => ({ ...prev, [pin.id]: false }))}
                      onMouseMove={(e) => {
                        setCardCursorPosition(prev => ({
                          ...prev,
                          [pin.id]: { x: e.clientX, y: e.clientY }
                        }));
                      }}
                      onClick={(e) => {
                        // Clicking anywhere on video toggles mute (both desktop and mobile)
                        toggleMute(pin.id);
                      }}
                    >
                      <video
                        ref={(el) => {
                          if (el && pin.id) {
                            videoRefs.current[pin.id] = el;
                            // Initialize as muted if state not set (for autoplay)
                            if (isSoundEnabled[pin.id] === undefined) {
                              setIsSoundEnabled(prev => ({ ...prev, [pin.id]: false }));
                              el.muted = true;
                            } else {
                              el.muted = !isSoundEnabled[pin.id];
                            }
                            // Try to play
                            el.play().catch(() => {});
                          }
                        }}
                        src={pin.video}
                        autoPlay
                        loop
                        muted={isSoundEnabled[pin.id] === undefined ? true : !isSoundEnabled[pin.id]}
                        playsInline
                        preload="metadata"
                        loading="lazy"
                        disablePictureInPicture
                        disableRemotePlayback
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ display: 'block' }}
                        onLoadedMetadata={(e) => {
                          e.currentTarget.currentTime = 0.1;
                          // Sync muted state
                          if (isSoundEnabled[pin.id] === undefined) {
                            e.currentTarget.muted = true;
                          } else {
                            e.currentTarget.muted = !isSoundEnabled[pin.id];
                          }
                          // Try to play
                          e.currentTarget.play().catch(() => {});
                        }}
                      />
                      {/* Mute/Unmute Toggle Button - only for Dubai videos */}
                      {(pin.id === 'dubai' || pin.id === 'medlab-dubai' || pin.video?.includes('DUBAI')) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleMute(pin.id);
                          }}
                          className="absolute top-2 right-2 z-20 p-1.5 rounded-full transition-colors touch-manipulation pointer-events-auto"
                          style={{ 
                            backgroundColor: '#FF9752', 
                            color: 'white',
                            minWidth: isMobile ? '44px' : 'auto',
                            minHeight: isMobile ? '44px' : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.backgroundColor = '#e6823a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isMobile) {
                              e.currentTarget.style.backgroundColor = '#FF9752';
                            }
                          }}
                          onTouchStart={(e) => {
                            e.currentTarget.style.backgroundColor = '#e6823a';
                          }}
                          onTouchEnd={(e) => {
                            setTimeout(() => {
                              e.currentTarget.style.backgroundColor = '#FF9752';
                            }, 150);
                          }}
                          aria-label={isSoundEnabled[pin.id] ? "Mute" : "Unmute"}
                        >
                          {isSoundEnabled[pin.id] ? (
                            <VolumeX className={isMobile ? "w-5 h-5 text-white" : "w-4 h-4 text-white"} />
                          ) : (
                            <Volume2 className={isMobile ? "w-5 h-5 text-white" : "w-4 h-4 text-white"} />
                          )}
                        </button>
                      )}
                    </div>
                  ) : pin.image ? (
                    <img 
                      src={pin.image} 
                      alt={pin.name} 
                      className="w-full object-cover" 
                      style={{ height: isMobile ? 'clamp(160px, 40vw, 200px)' : '256px' }}
                    />
                  ) : null}
                  <div style={{ padding: isMobile ? 'clamp(16px, 4vw, 24px)' : 'clamp(32px, 2vw, 32px)' }}>
                    <div className="font-bold mb-4 text-white" style={{ fontFamily: "TexGyreAdventor", fontSize: isMobile ? 'clamp(18px, 4.5vw, 24px)' : 'clamp(24px, 1.875vw, 30px)' }}>
                      {pin.name}
                    </div>
                    {pin.description && (
                      <p className="text-white leading-relaxed" style={{ fontSize: isMobile ? 'clamp(12px, 3vw, 14px)' : 'clamp(18px, 1.125vw, 18px)' }}>{pin.description}</p>
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
