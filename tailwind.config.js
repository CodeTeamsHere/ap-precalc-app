/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#15131a",
          50: "#f6f5f4",
          100: "#e9e7e3",
          200: "#cfccc6",
          300: "#a8a39a",
          400: "#7c766c",
          500: "#5b554c",
          600: "#403c34",
          700: "#2b2823",
          800: "#1d1b18",
          900: "#15131a",
        },
        paper: {
          DEFAULT: "#f6f1e7",
          50: "#fdfbf6",
          100: "#f9f4ea",
          200: "#f0e9d8",
          300: "#e4d9bf",
          400: "#cdbf9a",
          500: "#b0a079",
        },
        unit1: { DEFAULT: "#c2701b", soft: "#f4d8a5", ink: "#5a3409" },
        unit2: { DEFAULT: "#0e7c7b", soft: "#bce3df", ink: "#0a3c3c" },
        unit3: { DEFAULT: "#6f4ab8", soft: "#d8cbf2", ink: "#321f5e" },
        accent: "#c2701b",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(20, 14, 28, 0.04), 0 8px 30px -10px rgba(20, 14, 28, 0.18)",
        ring: "0 0 0 3px rgba(194, 112, 27, 0.25)",
      },
      typography: {
        DEFAULT: {
          css: {
            "h1, h2, h3, h4": { fontFamily: '"Fraunces", serif' },
          },
        },
      },
    },
  },
  plugins: [],
};
