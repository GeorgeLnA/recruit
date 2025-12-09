import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "@/lib/gsap";

interface VideoPlayerProps {
  src: string; // WebM video source
  poster?: string;
  className?: string;
  rounded?: string;
  aspectRatio?: string; // e.g., 'aspect-video'
  title?: string;
  preload?: "none" | "metadata" | "auto";
  lazy?: boolean; // Enable lazy loading
}

export default function VideoPlayer({
  src,
  poster,
  className = "",
  rounded = "rounded-2xl",
  aspectRatio = "aspect-video",
  title,
  preload = "metadata",
  lazy = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy); // Load immediately if not lazy

  // Reset state and video element when src changes (for switching videos)
  useEffect(() => {
    // Reset all state immediately - this must happen first
    setHasStarted(false);
    setIsPlaying(false);
    setCursorPosition({ x: 0, y: 0 });
    setIsHovering(false);
    
    // Reset video element after a brief delay to ensure React has updated
    const timer = setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.pause();
        // Always reset to 0 to show poster, not video frame
        v.currentTime = 0;
        // Force reload to apply new source and poster
        v.load();
      }
    }, 10);
    
    // Handle lazy loading - if video is visible, load it immediately
    if (lazy) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight + 200 && rect.bottom > -200;
        setShouldLoad(isVisible);
      } else {
        setShouldLoad(false);
      }
    } else {
      setShouldLoad(true);
    }
    
    return () => clearTimeout(timer);
  }, [src, poster, lazy]);

  // Lazy loading with Intersection Observer - more aggressive optimization
  useEffect(() => {
    if (!lazy || shouldLoad) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before video enters viewport for smoother experience
        threshold: 0.01,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [lazy, shouldLoad]);

  // Set up video event listeners to track play/pause state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    
    const updatePlayingState = () => {
      setIsPlaying(!v.paused && !v.ended && v.readyState > 2);
    };
    
    const onPlay = () => {
      setIsPlaying(true);
    };
    const onPlaying = () => {
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
    };
    const onLoadedMetadata = () => {
      // Only set currentTime if there's no poster (for vertical videos without posters)
      // For horizontal videos with posters, keep currentTime at 0 to show poster, not video frame
      if (!poster) {
        v.currentTime = 0.1;
      } else {
        // Ensure video stays at 0 to show poster image, not first frame
        v.currentTime = 0;
      }
      // Sync playing state with actual video state
      updatePlayingState();
    };
    const onTimeUpdate = () => {
      // Periodically check playing state to catch any missed events
      updatePlayingState();
    };
    
    // Add all event listeners
    v.addEventListener("play", onPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("timeupdate", onTimeUpdate);
    
    // Check initial playing state
    updatePlayingState();
    
    // Periodic check to ensure state stays in sync (every 100ms)
    const interval = setInterval(updatePlayingState, 100);
    
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("timeupdate", onTimeUpdate);
      clearInterval(interval);
    };
  }, [src, shouldLoad]); // Re-attach when src changes

  // Add expansion animation on hover for play button
  useEffect(() => {
    const button = playButtonRef.current;
    if (!button) return;

    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasStarted]);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    setHasStarted(true);
    // Reset to beginning if video was switched
    v.currentTime = 0;
    // Fade in video when starting to play
    v.style.opacity = '1';
    v.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  };

  const handleToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on the play button or pause button
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (hasStarted) {
      handleToggle();
    } else {
      handlePlay();
    }
  };

  // Handle mouse move for cursor label
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasStarted) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      // Calculate mouse position in viewport coordinates (for fixed positioning)
      const x = e.clientX;
      const y = e.clientY;
      
      // Constrain to container bounds
      const constrainedX = Math.max(rect.left, Math.min(x, rect.right));
      const constrainedY = Math.max(rect.top, Math.min(y, rect.bottom));
      
      setCursorPosition({ x: constrainedX, y: constrainedY });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasStarted]);

  // Check if video is horizontal (default aspect-video is 16:9, which is horizontal)
  const isHorizontal = aspectRatio === "aspect-video" || aspectRatio.includes("video") || !aspectRatio.includes("9/16");
  
  // Use sharp corners for horizontal videos with brackets
  const videoRounded = isHorizontal ? "" : rounded;

  return (
    <div className={`relative w-full ${aspectRatio} overflow-visible ${videoRounded} ${className}`}>
      <div 
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${videoRounded} cursor-pointer`}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${videoRounded}`}
          preload={shouldLoad ? preload : "none"}
          controls={false}
          playsInline
          poster={poster || undefined}
          aria-label={title || "Video"}
          key={src}
          style={{
            // Hide video frame until play is clicked - show poster instead
            opacity: hasStarted ? 1 : 0,
          }}
        >
          {shouldLoad && src && (
            <source key={src} src={src} type="video/webm" />
          )}
        </video>
        
        {/* Poster image overlay - shown when video hasn't started */}
        {!hasStarted && poster && (
          <img
            src={poster}
            alt={title || "Video thumbnail"}
            className={`absolute inset-0 h-full w-full object-cover ${videoRounded}`}
            style={{ zIndex: 1 }}
            loading="eager"
            fetchPriority="high"
          />
        )}

        {/* Initial Play Overlay */}
        {!hasStarted && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center" style={{ zIndex: 2 }}>
            <Button
              ref={playButtonRef}
              onClick={handlePlay}
              className="px-6 py-4 text-white font-bold bg-[var(--color-blue)] hover:bg-[var(--color-blue-dark)]"
              aria-label="Play video"
            >
              <Play className="w-5 h-5" />
              Play
            </Button>
          </div>
        )}

        {/* Floating Pause/Play toggle once started */}
        {hasStarted && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isPlaying ? "Pause video" : "Play video"}
            className="absolute bottom-4 left-4 inline-flex items-center justify-center rounded-full bg-[#FF9752] hover:bg-[#e6823a] text-white p-3 transition-colors z-10"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
        )}

        {/* Cursor-following pause/play label */}
        {hasStarted && isHovering && (
          <div
            className="fixed pointer-events-none z-50 flex flex-col items-center gap-1"
            style={{
              left: `calc(${cursorPosition.x + 14}px)`,
              top: `calc(${cursorPosition.y + 30}px)`,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform'
            }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
            <div
              className="px-2 py-1 rounded-lg bg-white shadow-lg whitespace-nowrap"
              style={{
                fontFamily: 'TexGyreAdventor',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--color-blue)'
              }}
            >
              {isPlaying ? 'Click to pause' : 'Click to play'}
            </div>
          </div>
        )}
      </div>

      {/* Corner brackets for horizontal videos */}
      {isHorizontal && (
        <>
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-24 h-1.5" style={{ backgroundColor: 'var(--color-blue)' }}></div>
            <div className="absolute top-0 left-0 w-1.5 h-24" style={{ backgroundColor: 'var(--color-blue)' }}></div>
          </div>
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute top-0 right-0 w-24 h-1.5" style={{ backgroundColor: 'var(--color-blue)' }}></div>
            <div className="absolute top-0 right-0 w-1.5 h-24" style={{ backgroundColor: 'var(--color-blue)' }}></div>
          </div>
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute bottom-0 left-0 w-24 h-1.5" style={{ backgroundColor: 'var(--color-blue)' }}></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-24" style={{ backgroundColor: 'var(--color-blue)' }}></div>
          </div>
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute bottom-0 right-0 w-24 h-1.5" style={{ backgroundColor: 'var(--color-blue)' }}></div>
            <div className="absolute bottom-0 right-0 w-1.5 h-24" style={{ backgroundColor: 'var(--color-blue)' }}></div>
          </div>
        </>
      )}
    </div>
  );
}


