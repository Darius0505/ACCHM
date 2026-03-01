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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#5E6AD2", // Soft Indigo
          hover: "#4F5BBE",
        },
        // Mệnh Hỏa 🔥 Dark Theme Colors
        fire: {
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
        },
        slate: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          400: "#94A3B8",
          300: "#CBD5E1",
          100: "#F1F5F9",
        },
        surface: "#FFFFFF",
        text: {
          primary: "#1A1D2D",
          secondary: "#5F6B7C",
          tertiary: "#8E99A8",
        },
        border: "#E2E4EA",
        success: {
          DEFAULT: "#22C55E",
          bg: "#DCFCE7",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#EF4444",
          bg: "#FEE2E2",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        lifted: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        floating: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
