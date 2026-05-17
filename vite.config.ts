import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "./" makes the build work on GitHub Pages project subpaths and Vercel root alike.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ["plotly.js-dist-min", "react-plotly.js"],
          math: ["mathjs"],
          katex: ["katex", "react-katex"],
        },
      },
    },
  },
});
