import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vb: {
          black: "#080b12",
          navy: "#0d1220",
          panel: "#111827",
          border: "#1e2d45",
          blue: "#1d6ef5",
          "blue-bright": "#3b82f6",
          amber: "#f59e0b",
          "amber-dim": "#b45309",
          green: "#10b981",
          red: "#ef4444",
          text: "#f0f4fc",
          "text-secondary": "#b8c7e0",
          muted: "#7a8faa",
          subtle: "#334155",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "vb-grid":
          "linear-gradient(rgba(29,110,245,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,245,.06) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(29,110,245,.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(245,158,11,.07) 0%, transparent 50%)",
      },
      backgroundSize: {
        grid: "60px 60px",
      },
      keyframes: {
        "vb-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        floatBadge: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "vb-pulse": "vb-pulse 2s ease-in-out infinite",
        ticker: "ticker 30s linear infinite",
        float: "floatBadge 4s ease-in-out infinite",
        "fade-in": "fadeSlideIn 0.2s ease",
      },
    },
  },
  plugins: [],
};

export default config;
