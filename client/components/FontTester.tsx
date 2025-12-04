import { useState, useRef, useEffect } from "react";
import { Type, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useFont } from "@/contexts/FontContext";
import { cn } from "@/lib/utils";

export function FontTester() {
  const { currentFont, fontSettings, setFont, setFontSettings, resetFont, resetFontSettings, availableFonts } = useFont();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFont, setExpandedFont] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;

    if (isOpen) {
      panelRef.current.style.display = "block";
      panelRef.current.style.visibility = "visible";
      gsap.fromTo(
        panelRef.current,
        { x: -320, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(panelRef.current, {
        x: -320,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          if (panelRef.current) {
            panelRef.current.style.display = "none";
            panelRef.current.style.visibility = "hidden";
          }
        },
      });
    }
  }, [isOpen]);

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-r-xl shadow-lg",
          "flex items-center justify-center",
          "bg-[var(--theme-background)] text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2",
          "transition-transform active:scale-95"
        )}
        aria-label="Toggle font tester"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Type className="w-5 h-5" />
        )}
      </button>

      {/* Font Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute left-20 top-1/2 -translate-y-1/2 w-80 rounded-xl shadow-2xl",
          "bg-[var(--theme-background)] border border-gray-200",
          "backdrop-blur-sm max-h-[60vh] overflow-y-auto"
        )}
        style={{ display: "none", visibility: "hidden" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-[var(--theme-background)] z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Font Tester
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetFont();
                  resetFontSettings();
                }}
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded",
                  "text-gray-500 hover:text-gray-700",
                  "transition-colors"
                )}
                title="Reset to default"
                aria-label="Reset font"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Font List */}
        <div className="p-4 space-y-2">
          {availableFonts.map((font) => {
            const isSelected = currentFont === font.value;
            const isExpanded = expandedFont === font.value;
            
            return (
              <div
                key={font.value}
                className={cn(
                  "w-full rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/5"
                    : "border-gray-300"
                )}
              >
                <button
                  onClick={() => {
                    setFont(font.value);
                    setExpandedFont(isExpanded ? null : font.value);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-lg transition-all",
                    "hover:bg-white/50"
                  )}
                  style={{ fontFamily: font.value }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {font.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {font.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[var(--theme-accent)]" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div
                    className="text-xs text-gray-600 mt-2"
                    style={{ fontFamily: font.value }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </button>

                {/* Expanded Controls */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-2 space-y-3 border-t border-gray-200 mt-2">
                    {/* Font Weight */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">
                          Font Weight
                        </label>
                        <span className="text-xs text-gray-500">{fontSettings.weight}</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="900"
                        step="100"
                        value={fontSettings.weight}
                        onChange={(e) => setFontSettings({ weight: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>100</span>
                        <span>400</span>
                        <span>700</span>
                        <span>900</span>
                      </div>
                    </div>

                    {/* Letter Spacing */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">
                          Letter Spacing
                        </label>
                        <span className="text-xs text-gray-500">{fontSettings.letterSpacing.toFixed(2)}em</span>
                      </div>
                      <input
                        type="range"
                        min="-0.1"
                        max="0.3"
                        step="0.01"
                        value={fontSettings.letterSpacing}
                        onChange={(e) => setFontSettings({ letterSpacing: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>-0.1</span>
                        <span>0</span>
                        <span>0.15</span>
                        <span>0.3</span>
                      </div>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700">
                          Line Height
                        </label>
                        <span className="text-xs text-gray-500">{fontSettings.lineHeight.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.05"
                        value={fontSettings.lineHeight}
                        onChange={(e) => setFontSettings({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>1.0</span>
                        <span>1.5</span>
                        <span>2.0</span>
                        <span>2.5</span>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Font Display */}
        <div className="px-4 py-3 border-t border-gray-100 bg-[var(--theme-background)]/80">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
            Current Font
          </div>
          <div
            className="text-sm font-semibold text-gray-900"
            style={{ fontFamily: currentFont }}
          >
            {availableFonts.find((f) => f.value === currentFont)?.label || currentFont}
          </div>
        </div>
      </div>
    </div>
  );
}

