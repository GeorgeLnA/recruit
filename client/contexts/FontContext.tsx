import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface FontOption {
  label: string;
  value: string;
  category: string;
  googleFont?: boolean;
}

export interface FontSettings {
  weight: number;
  letterSpacing: number;
  lineHeight: number;
}

interface FontContextType {
  currentFont: string;
  fontSettings: FontSettings;
  setFont: (font: string) => void;
  setFontSettings: (settings: Partial<FontSettings>) => void;
  resetFont: () => void;
  resetFontSettings: () => void;
  availableFonts: FontOption[];
}

const FontContext = createContext<FontContextType | undefined>(undefined);

const DEFAULT_FONT = "Raleway, TexGyreAdventor, Inter, sans-serif";

const DEFAULT_FONT_SETTINGS: FontSettings = {
  weight: 600, // semibold weight (Raleway default)
  letterSpacing: 0.00, // 0.00em (default)
  lineHeight: 1.50, // standard line height
};

const AVAILABLE_FONTS: FontOption[] = [
  // Custom fonts
  {
    label: "TexGyre Adventor",
    value: "TexGyreAdventor, Inter, sans-serif",
    category: "Custom",
  },
  {
    label: "Josefin Sans",
    value: "'Josefin Sans', sans-serif",
    category: "Custom",
  },
  {
    label: "CC SuperHuman",
    value: "'CC SuperHuman', sans-serif",
    category: "Custom",
  },
  {
    label: "Manrope",
    value: "'Manrope', sans-serif",
    category: "Custom",
  },
  {
    label: "Vipnagorgialla",
    value: "'Vipnagorgialla', sans-serif",
    category: "Custom",
  },
  {
    label: "Engebrechtre",
    value: "'Engebrechtre', sans-serif",
    category: "Custom",
  },
  {
    label: "Stormfaze",
    value: "'Stormfaze', sans-serif",
    category: "Custom",
  },
  {
    label: "Matamata",
    value: "'Matamata', sans-serif",
    category: "Custom",
  },
  {
    label: "Inter",
    value: "Inter, sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  // Google Fonts - Sans Serif
  {
    label: "Roboto",
    value: "'Roboto', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Open Sans",
    value: "'Open Sans', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Lato",
    value: "'Lato', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Montserrat",
    value: "'Montserrat', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Poppins",
    value: "'Poppins', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Raleway",
    value: "'Raleway', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Source Sans Pro",
    value: "'Source Sans Pro', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Nunito",
    value: "'Nunito', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "Work Sans",
    value: "'Work Sans', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  // Google Fonts - Serif
  {
    label: "Playfair Display",
    value: "'Playfair Display', serif",
    category: "Google Font (Serif)",
    googleFont: true,
  },
  {
    label: "Merriweather",
    value: "'Merriweather', serif",
    category: "Google Font (Serif)",
    googleFont: true,
  },
  {
    label: "Lora",
    value: "'Lora', serif",
    category: "Google Font (Serif)",
    googleFont: true,
  },
  {
    label: "Crimson Text",
    value: "'Crimson Text', serif",
    category: "Google Font (Serif)",
    googleFont: true,
  },
  // Google Fonts - Display
  {
    label: "Oswald",
    value: "'Oswald', sans-serif",
    category: "Google Font (Display)",
    googleFont: true,
  },
  {
    label: "Bebas Neue",
    value: "'Bebas Neue', sans-serif",
    category: "Google Font (Display)",
    googleFont: true,
  },
  {
    label: "Barlow",
    value: "'Barlow', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  {
    label: "DM Sans",
    value: "'DM Sans', sans-serif",
    category: "Google Font",
    googleFont: true,
  },
  // System fonts
  {
    label: "System Default",
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    category: "System",
  },
  {
    label: "Arial",
    value: "Arial, sans-serif",
    category: "System",
  },
  {
    label: "Helvetica",
    value: "Helvetica, Arial, sans-serif",
    category: "System",
  },
  {
    label: "Georgia",
    value: "Georgia, serif",
    category: "System",
  },
  {
    label: "Times New Roman",
    value: "'Times New Roman', Times, serif",
    category: "System",
  },
];

export function FontProvider({ children }: { children: ReactNode }) {
  const [currentFont, setCurrentFontState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selected-font");
      if (saved) {
        return saved;
      }
    }
    return DEFAULT_FONT;
  });

  const [fontSettings, setFontSettingsState] = useState<FontSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("font-settings");
      if (saved) {
        try {
          return { ...DEFAULT_FONT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_FONT_SETTINGS;
        }
      }
    }
    return DEFAULT_FONT_SETTINGS;
  });

  // Load Google Fonts dynamically - load all at once for instant switching
  useEffect(() => {
    const googleFonts = AVAILABLE_FONTS.filter((font) => font.googleFont);
    const fontFamilies = googleFonts.map((font) => {
      const family = font.value.match(/'([^']+)'/)?.[1] || font.value.split(",")[0].trim().replace(/'/g, "");
      return family;
    });

    // Remove duplicates
    const uniqueFonts = Array.from(new Set(fontFamilies));

    // Load all Google Fonts at once for instant font switching
    if (uniqueFonts.length > 0) {
      const existingLink = document.querySelector('link[data-google-fonts]');
      if (existingLink) {
        return; // Already loaded
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.setAttribute('data-google-fonts', 'true');
      link.href = `https://fonts.googleapis.com/css2?${uniqueFonts
        .map((font) => `family=${font.replace(/\s+/g, "+")}:wght@400;500;600;700;800`)
        .join("&")}&display=swap`;
      document.head.appendChild(link);
    }
  }, []);

  // Apply font and settings to document - apply globally to all elements
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-family", currentFont);
    root.style.setProperty("--font-weight", fontSettings.weight.toString());
    root.style.setProperty("--letter-spacing", `${fontSettings.letterSpacing}em`);
    root.style.setProperty("--line-height", fontSettings.lineHeight.toString());
    
    // Apply to body and html
    document.body.style.fontFamily = currentFont;
    document.body.style.fontWeight = fontSettings.weight.toString();
    document.body.style.letterSpacing = `${fontSettings.letterSpacing}em`;
    document.body.style.lineHeight = fontSettings.lineHeight.toString();
    
    document.documentElement.style.fontFamily = currentFont;
    document.documentElement.style.fontWeight = fontSettings.weight.toString();
    document.documentElement.style.letterSpacing = `${fontSettings.letterSpacing}em`;
    document.documentElement.style.lineHeight = fontSettings.lineHeight.toString();

    // Apply to all elements using a style tag for maximum coverage (font-size excluded to preserve relative sizing)
    const styleId = "font-global-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      * {
        font-family: ${currentFont} !important;
        font-weight: ${fontSettings.weight} !important;
        letter-spacing: ${fontSettings.letterSpacing}em !important;
        line-height: ${fontSettings.lineHeight} !important;
      }
    `;

    localStorage.setItem("selected-font", currentFont);
    localStorage.setItem("font-settings", JSON.stringify(fontSettings));
  }, [currentFont, fontSettings]);

  const setFont = (font: string) => {
    setCurrentFontState(font);
  };

  const setFontSettings = (settings: Partial<FontSettings>) => {
    setFontSettingsState((prev) => ({ ...prev, ...settings }));
  };

  const resetFont = () => {
    setCurrentFontState(DEFAULT_FONT);
  };

  const resetFontSettings = () => {
    setFontSettingsState(DEFAULT_FONT_SETTINGS);
  };

  return (
    <FontContext.Provider
      value={{
        currentFont,
        fontSettings,
        setFont,
        setFontSettings,
        resetFont,
        resetFontSettings,
        availableFonts: AVAILABLE_FONTS,
      }}
    >
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (context === undefined) {
    throw new Error("useFont must be used within a FontProvider");
  }
  return context;
}

