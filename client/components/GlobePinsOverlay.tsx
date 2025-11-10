"use client";

import { forwardRef, MutableRefObject } from "react";

export interface EarthPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  image?: string;
  description?: string;
}

interface GlobePinsOverlayProps {
  pins: EarthPin[];
  pinRefs: MutableRefObject<Record<string, HTMLDivElement>>;
  selectedId: string | null;
  onSelectPin?: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  className?: string;
}

const GlobePinsOverlay = forwardRef<HTMLDivElement, GlobePinsOverlayProps>(
  ({ pins, pinRefs, selectedId, onSelectPin, setSelectedId, className = "" }, overlayRef) => {
    return (
      <div
        ref={overlayRef}
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{ transform: "translateZ(0)" }}
      >
        {pins.map((pin) => (
          <div
            key={pin.id}
            ref={(el) => {
              if (el) pinRefs.current[pin.id] = el;
            }}
            className="absolute"
            style={{ display: "none" }}
          >
            <div className="pointer-events-auto flex flex-col items-center">
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-[#00BFFF] opacity-30 animate-ping" />
                <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(pin.id);
                  onSelectPin?.(pin.id);
                }}
                className="relative block w-2.5 h-2.5 rounded-full bg-[#00BFFF] shadow ring-2 ring-white/70"
                aria-label={`Select ${pin.name}`}
              />
              </div>
              <div className="mt-1 px-1 rounded text-[10px] font-semibold text-white/90 bg-black/50 whitespace-nowrap">
                {pin.name}
              </div>
              {selectedId === pin.id && (
                <div className="mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                  {pin.image && <img src={pin.image} alt={pin.name} className="w-full h-28 object-cover" />}
                  <div className="p-3">
                    <div className="text-sm font-bold mb-1">
                      {pin.name}
                    </div>
                    {pin.description && <p className="text-xs text-white">{pin.description}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

GlobePinsOverlay.displayName = "GlobePinsOverlay";

export default GlobePinsOverlay;


