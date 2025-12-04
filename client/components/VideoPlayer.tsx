import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "@/lib/gsap";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  rounded?: string;
  aspectRatio?: string; // e.g., 'aspect-video'
  title?: string;
}

export default function VideoPlayer({
  src,
  poster,
  className = "",
  rounded = "rounded-2xl",
  aspectRatio = "aspect-video",
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => {
      // Set thumbnail to 0.1 seconds
      v.currentTime = 0.1;
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

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
    v.play();
  };

  const handleToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
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

  // Check if video is horizontal (default aspect-video is 16:9, which is horizontal)
  const isHorizontal = aspectRatio === "aspect-video" || aspectRatio.includes("video") || !aspectRatio.includes("9/16");
  
  // Use sharp corners for horizontal videos with brackets
  const videoRounded = isHorizontal ? "" : rounded;

  return (
    <div className={`relative w-full ${aspectRatio} overflow-visible ${videoRounded} ${className}`}>
      <div 
        className={`relative w-full h-full overflow-hidden ${videoRounded} cursor-pointer`}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${videoRounded}`}
          src={src}
          preload="metadata"
          controls={false}
          playsInline
          poster={poster}
          aria-label={title || "Video"}
        />

        {/* Initial Play Overlay */}
        {!hasStarted && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
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
      </div>

      {/* Corner brackets for horizontal videos */}
      {isHorizontal && (
        <>
          {/* Top-left corner */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute top-0 left-0 w-24 h-1.5" style={{ backgroundColor: '#464C53' }}></div>
            <div className="absolute top-0 left-0 w-1.5 h-24" style={{ backgroundColor: '#464C53' }}></div>
          </div>
          {/* Top-right corner */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute top-0 right-0 w-24 h-1.5" style={{ backgroundColor: '#464C53' }}></div>
            <div className="absolute top-0 right-0 w-1.5 h-24" style={{ backgroundColor: '#464C53' }}></div>
          </div>
          {/* Bottom-left corner */}
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute bottom-0 left-0 w-24 h-1.5" style={{ backgroundColor: '#464C53' }}></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-24" style={{ backgroundColor: '#464C53' }}></div>
          </div>
          {/* Bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none z-10">
            <div className="absolute bottom-0 right-0 w-24 h-1.5" style={{ backgroundColor: '#464C53' }}></div>
            <div className="absolute bottom-0 right-0 w-1.5 h-24" style={{ backgroundColor: '#464C53' }}></div>
          </div>
        </>
      )}
    </div>
  );
}


