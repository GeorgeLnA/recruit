interface HeroProps {
  videoSrcMp4: string;
  posterSrc: string;
  headline: string;
  subhead?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  badges?: string[];
}

export default function Hero({
  videoSrcMp4,
  posterSrc,
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  badges,
}: HeroProps) {
  return (
    <section className="relative isolate h-screen w-full flex items-center justify-center">
      {/* Layer 1: Video Frame Unit */}
      <div className="w-full max-w-7xl mx-auto px-6">
        {/* Video container with frame styling */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
          {/* 16:9 aspect ratio wrapper */}
          <div className="aspect-[16/9] relative">
            {/* Video element */}
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={posterSrc}
            >
              <source src={videoSrcMp4} type="video/mp4" />
              {/* Non-JS fallback image */}
              <img src={posterSrc} alt={headline} className="absolute inset-0 h-full w-full object-cover" />
              Your browser does not support the video tag.
            </video>

            {/* Top gradient overlay for readability */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />

            {/* Bottom gradient overlay for readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {/* Content layer inside the frame (z-10 for content overlays) */}
            <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white z-10">
              {/* Badges */}
              {badges && badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {badges.map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
                {headline}
              </h1>

              {/* Subhead */}
              {subhead && (
                <p className="text-base sm:text-lg md:text-xl mb-6 max-w-2xl">
                  {subhead}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mt-6">
                {primaryCta && (
                  <a
                    href={primaryCta.href}
                    role="button"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-white font-semibold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {primaryCta.label}
                  </a>
                )}
                {secondaryCta && (
                  <a
                    href={secondaryCta.href}
                    role="button"
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-colors border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  >
                    {secondaryCta.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
