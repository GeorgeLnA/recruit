import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

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

  return (
    <div className={`relative w-full ${aspectRatio} overflow-hidden ${rounded} ${className}`}>
      <video
        ref={videoRef}
        className={`h-full w-full object-cover ${rounded}`}
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
            onClick={handlePlay}
            className="px-6 py-4 text-white font-bold"
            style={{ backgroundColor: "#ff3a34", fontFamily: "Milker" }}
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
          className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-full bg-black/60 hover:bg-black/70 text-white p-3 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}


