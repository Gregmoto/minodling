import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primära naturfärger
        green: {
          50: "#f0f7f0",
          100: "#dceddc",
          200: "#bbdcbb",
          300: "#8fc48f",
          400: "#5fa65f",
          500: "#3d873d",
          600: "#2d6b2d",
          700: "#265626",
          800: "#214521",
          900: "#1c381c",
          950: "#0e1f0e",
        },
        sage: {
          50: "#f4f7f4",
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
        earth: {
          50: "#faf7f2",
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
        cream: {
          50: "#fefdf9",
          100: "#fdf9f0",
          200: "#faf2de",
          300: "#f5e8c4",
          400: "#edd9a0",
          500: "#e3c87a",
        },
        forest: {
          600: "#2d5a3d",
          700: "#234832",
          800: "#1a3626",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-nature":
          "linear-gradient(135deg, #f0f7f0 0%, #faf7f2 50%, #fdf9f0 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
