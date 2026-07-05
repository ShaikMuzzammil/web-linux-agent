import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ["var(--font-ubuntu)", "Ubuntu", "sans-serif"],
        mono: ["'Ubuntu Mono'", "Courier New", "monospace"],
      },
      colors: {
        ubuntu: {
          orange: "#E95420",
          purple: "#772953",
          aubergine: "#2C001E",
          warmgrey: "#AEA79F",
          coolgrey: "#333333",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease forwards",
        "slide-down": "slideDown 0.2s ease forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "boot-pulse": "bootPulse 1.5s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
