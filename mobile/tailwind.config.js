/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1", // Indigo 500
          light: "#818CF8",   // Indigo 400
          dark: "#4F46E5",    // Indigo 600
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#A855F7", // Purple 500
          light: "#C084FC",   // Purple 400
          dark: "#9333EA",    // Purple 600
          foreground: "#FFFFFF",
        },
        background: {
          DEFAULT: "#0F172A", // Slate 900 (Deep dark blue-ish)
          light: "#1E293B",   // Slate 800
          lighter: "#334155", // Slate 700
          subtle: "#1E293B",  // Card background
        },
        surface: {
          DEFAULT: "#1E293B", // Same as background light for cards
          light: "#334155",
          dark: "#020617",
        },
        text: {
          primary: "#F8FAFC",   // Slate 50
          secondary: "#94A3B8", // Slate 400
          tertiary: "#64748B",  // Slate 500
          muted: "#475569",     // Slate 600
        },
        accent: {
          DEFAULT: "#F43F5E",   // Rose 500
          success: "#10B981",   // Emerald 500
          warning: "#F59E0B",   // Amber 500
          error: "#EF4444",     // Red 500
          info: "#3B82F6",      // Blue 500
        },
        border: "#334155",      // Slate 700
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      }
    },
  },
  plugins: [],
};
