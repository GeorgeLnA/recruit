import { useState, useRef, useEffect } from "react";
import { Palette, X, RotateCcw } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ColorThemeSwitcher() {
  const { colors, setColor, resetColors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const colorTypes: Array<{
    key: "peach" | "blue" | "white";
    label: string;
  }> = [
    {
      key: "peach",
      label: "Accent",
    },
    {
      key: "blue",
      label: "Highlight",
    },
    {
      key: "white",
      label: "Base",
    },
  ];

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

  const handleColorChange = (type: "peach" | "blue" | "white", value: string) => {
    setColor(type, value);
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
      {/* Toggle Button - No hover animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-r-xl shadow-lg",
          "flex items-center justify-center",
          "bg-[var(--theme-accent)] text-white",
          "focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:ring-offset-2",
          "transition-transform active:scale-95"
        )}
        aria-label="Toggle color theme switcher"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Palette className="w-5 h-5" />
        )}
      </button>

      {/* Theme Panel */}
      <div
        ref={panelRef}
        className={cn(
          "absolute left-20 top-0 w-80 rounded-r-xl shadow-2xl",
          "bg-white border border-gray-200",
          "backdrop-blur-sm"
        )}
        style={{ display: "none", visibility: "hidden" }}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              Color Theme
            </h3>
            <button
              onClick={resetColors}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded",
                "text-gray-500 hover:text-gray-700",
                "transition-colors"
              )}
              title="Reset to defaults"
              aria-label="Reset colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Color Controls */}
        <div className="p-4 space-y-3">
          {colorTypes.map((colorType) => (
            <div key={colorType.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={`color-${colorType.key}`}
                  className="text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer"
                >
                  {colorType.label}
                </label>
                <div
                  className="w-6 h-6 rounded border-2 border-gray-200 shadow-sm cursor-pointer transition-transform active:scale-95"
                  style={{ backgroundColor: colors[colorType.key] }}
                  onClick={() => {
                    const input = document.getElementById(
                      `color-${colorType.key}`
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  id={`color-${colorType.key}`}
                  type="color"
                  value={colors[colorType.key]}
                  onChange={(e) => handleColorChange(colorType.key, e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-gray-200 cursor-pointer transition-all hover:border-gray-300"
                  style={{
                    backgroundColor: colors[colorType.key],
                  }}
                />
                <input
                  type="text"
                  value={colors[colorType.key].toUpperCase()}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      if (value.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(value)) {
                        handleColorChange(colorType.key, value);
                      }
                    }
                  }}
                  className="w-20 h-9 px-2 text-xs font-mono rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent transition-all text-black"
                  placeholder="#000000"
                  style={{ color: "#000000" }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider text-center">
            Live Preview
          </div>
        </div>
      </div>
    </div>
  );
}
