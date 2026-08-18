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
        // Varumärkesramp: ljusgrön → bladgrön → teal.
        // Ljusa steg = badges/ytor, 500 = accentgrön, 700+ = primär teal.
        green: {
          50:  "#f2f7ef",
          100: "#eaf2e6",
          200: "#c8dcc8",
          300: "#9cc79b",
          400: "#6fa96d",
          500: "#4f8f4e",   // accentgrön (logotypens "Odling")
          600: "#3d7a3c",
          700: "#1e5450",   // primär teal (logotypens "Min")
          800: "#143b38",
          900: "#0e2b29",
          950: "#071a19",
        },

        // Sage – varma neutraler: kantlinjer, dämpad text, ytor
        sage: {
          50:  "#faf8f2",
          100: "#efebe0",
          200: "#e4e0d4",   // kantlinje
          300: "#c9c3b2",
          400: "#a8a392",
          500: "#8a9184",
          600: "#5c6b60",   // dämpad text
          700: "#47534a",
          800: "#363f38",
          900: "#22302a",   // brödtext
        },

        // Harvest – terrakotta-accent
        harvest: {
          50:  "#fdf3ec",
          100: "#f7e8dc",
          200: "#f0d0b6",
          300: "#e4ae85",
          400: "#d68a55",
          500: "#c4682f",   // accent
          600: "#a85a28",
          700: "#8c4a21",
          800: "#713c1d",
          900: "#5c321b",
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

        // Cream – bakgrunder
        cream: {
          50:  "#f7f5ef",   // sidans primära bakgrund
          100: "#fdfcf8",
          200: "#f2efe4",
          300: "#eae5d5",
          400: "#ded7c2",
          500: "#cfc6ac",
        },

        // Forest – djup teal
        forest: {
          600: "#1e5450",
          700: "#163f3c",
          800: "#0e2b29",
        },
      },

      // ── Typografi ────────────────────────────────────────────────
      fontFamily: {
        sans:    ["var(--font-karla)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
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
        green:        "0 4px 14px rgba(30,84,80,0.20)",
        harvest:      "0 4px 14px rgba(196,104,47,0.22)",
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
        "gradient-nature":  "linear-gradient(135deg, #eaf2e6 0%, #f7f5ef 50%, #fdfcf8 100%)",
        "gradient-green":   "linear-gradient(135deg, #4f8f4e 0%, #1e5450 100%)",
        "gradient-harvest": "linear-gradient(135deg, #c4682f 0%, #8c4a21 100%)",
        "gradient-hero":    "linear-gradient(135deg, #eaf2e6 0%, #f7f5ef 40%, #fdfcf8 70%, #faf8f2 100%)",
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
