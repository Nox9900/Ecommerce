/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary-DEFAULT)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary-DEFAULT)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)",
          foreground: "var(--color-secondary-foreground)",
        },
        background: {
          DEFAULT: "var(--color-background-DEFAULT)",
          light: "var(--color-background-light)",
          lighter: "var(--color-background-lighter)",
          subtle: "var(--color-background-subtle)",
        },
        surface: {
          DEFAULT: "var(--color-surface-DEFAULT)",
          light: "var(--color-surface-light)",
          dark: "var(--color-surface-dark)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          muted: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-accent-DEFAULT)",
          success: "var(--color-accent-success)",
          warning: "var(--color-accent-warning)",
          error: "var(--color-accent-error)",
          info: "var(--color-accent-info)",
        },
        border: "var(--color-border)",
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
