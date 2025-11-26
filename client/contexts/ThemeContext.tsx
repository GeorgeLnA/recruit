import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ThemeColors {
  peach: string; // Brand peach tone
  blue: string;  // Brand light blue tone
  white: string; // Brand white tone
}

interface ThemeContextType {
  colors: ThemeColors;
  setColor: (type: keyof ThemeColors, color: string) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  resetColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_COLORS: ThemeColors = {
  peach: "#FF914D",
  blue: "#00BFFF",
  white: "#FFFFFF",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colors, setColorsState] = useState<ThemeColors>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("custom-theme-colors");
      if (saved) {
        try {
          return { ...DEFAULT_COLORS, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_COLORS;
        }
      }
    }
    return DEFAULT_COLORS;
  });

  useEffect(() => {
    const root = document.documentElement;

    // Peach group
    root.style.setProperty("--color-peach", colors.peach);
    root.style.setProperty("--color-peach-rgb", hexToRgb(colors.peach));
    root.style.setProperty("--color-peach-dark", darkenColor(colors.peach, 15));
    root.style.setProperty("--color-peach-light", adjustColorBrightness(colors.peach, 15));

    // Blue group
    root.style.setProperty("--color-blue", colors.blue);
    root.style.setProperty("--color-blue-rgb", hexToRgb(colors.blue));
    root.style.setProperty("--color-blue-dark", darkenColor(colors.blue, 15));
    root.style.setProperty("--color-blue-light", adjustColorBrightness(colors.blue, 20));
    root.style.setProperty("--color-blue-soft", adjustColorBrightness(colors.blue, 40));

    // White group
    root.style.setProperty("--color-white", colors.white);
    root.style.setProperty("--color-white-rgb", hexToRgb(colors.white));

    // Legacy aliases (existing CSS references)
    root.style.setProperty("--theme-accent", colors.peach);
    root.style.setProperty("--theme-accent-hover", darkenColor(colors.peach, 10));
    root.style.setProperty("--theme-background", colors.white);
    root.style.setProperty("--theme-dark", "#2a2a2a");
    root.style.setProperty("--theme-scrollbar", colors.blue);

    localStorage.setItem("custom-theme-colors", JSON.stringify(colors));
  }, [colors]);

  const setColor = (type: keyof ThemeColors, color: string) => {
    setColorsState((prev) => ({ ...prev, [type]: color }));
  };

  const setColors = (newColors: Partial<ThemeColors>) => {
    setColorsState((prev) => ({ ...prev, ...newColors }));
  };

  const resetColors = () => {
    setColorsState(DEFAULT_COLORS);
  };

  return (
    <ThemeContext.Provider value={{ colors, setColor, setColors, resetColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Helper utilities
function darkenColor(color: string, percent: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100)));
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function hexToRgb(color: string): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `${r} ${g} ${b}`;
}

