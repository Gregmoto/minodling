import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Färgpalett ──────────────────────────────────────────────
      colors: {
        // Primär grön – brand primary
        green: {
          50:  "#f0f7f0",
          100: "#dceddc",
          200: "#bbdcbb",
          300: "#8fc48f",
          400: "#5fa65f",
          500: "#4CAF50",   // brand primary (#4CAF50)
          600: "#3d8c40",
          700: "#2d6b2d",
          800: "#265626",
          900: "#1c381c",
          950: "#0e1f0e",
        },

        // Sage – mjuk sekundär grön
        sage: {
          50:  "#f4f7f4",
          100: "#e6ede6",
          200: "#cddacd",
          300: "#aabfaa",
          400: "#849e84",
          500: "#658065",
          600: "#4f664f",
          700: "#405240",
          800: "#354235",
          900: "#2c372c",
        },

        // Harvest orange – accent för skördesäsong och CTAs
        harvest: {
          50:  "#fff8f1",
          100: "#feecda",
          200: "#fdd5b0",
          300: "#fbb77d",
          400: "#f89147",
          500: "#f47220",   // brand accent
          600: "#e55a0e",
          700: "#c04309",
          800: "#9a360d",
          900: "#7c2e0e",
        },

        // Earth – varma jordtoner
        earth: {
          50:  "#faf7f2",
          100: "#f2ebe0",
          200: "#e4d5be",
          300: "#d4b994",
          400: "#c29870",
          500: "#b37f55",
          600: "#9a6748",
          700: "#7f523c",
          800: "#694436",
          900: "#573830",
        },

        // Cream – bakgrundsfärger
        cream: {
          50:  "#F8F9F7",   // sidans primära bakgrund
          100: "#fdf9f0",
          200: "#faf2de",
          300: "#f5e8c4",
          400: "#edd9a0",
          500: "#e3c87a",
        },

        // Forest – mörkare grönt
        forest: {
          600: "#2d5a3d",
          700: "#234832",
          800: "#1a3626",
        },
      },

      // ── Typografi ────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      // ── Radier ───────────────────────────────────────────────────
      borderRadius: {
        "2xl":  "1rem",      // 16px – cards
        "3xl":  "1.5rem",    // 24px
        "4xl":  "2rem",      // 32px
        pill:   "9999px",    // buttons pill-style
      },

      // ── Skuggor ──────────────────────────────────────────────────
      boxShadow: {
        xs:           "0 1px 2px rgba(0,0,0,0.05)",
        soft:         "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        card:         "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.06)",
        "inner-sm":   "inset 0 1px 3px rgba(0,0,0,0.07)",
        green:        "0 4px 14px rgba(76,175,80,0.25)",
        harvest:      "0 4px 14px rgba(244,114,32,0.25)",
      },

      // ── Animationer ──────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.2s ease-out",
        "slide-up":   "slide-up 0.25s ease-out",
        "slide-down": "slide-down 0.2s ease-out",
        shimmer:      "shimmer 1.5s infinite",
      },

      // ── Bakgrunder ───────────────────────────────────────────────
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-nature":  "linear-gradient(135deg, #f0f7f0 0%, #faf7f2 50%, #fdf9f0 100%)",
        "gradient-green":   "linear-gradient(135deg, #4CAF50 0%, #2d6b2d 100%)",
        "gradient-harvest": "linear-gradient(135deg, #f47220 0%, #c04309 100%)",
        "gradient-hero":    "linear-gradient(135deg, #f0f7f0 0%, #faf7f2 40%, #fdf9f0 70%, #f4f7f4 100%)",
      },

      // ── Spacing extras ───────────────────────────────────────────
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
