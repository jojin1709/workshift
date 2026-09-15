import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050B1A",
          900: "#0A1330",
          800: "#101B44",
          700: "#162761"
        },
        brand: {
          50: "#EEF4FF",
          100: "#DCE8FF",
          300: "#8FB4FF",
          500: "#2E6BFF",
          600: "#1E52D9",
          700: "#173FA8"
        },
        coverage: {
          high: "#1E8E5A",
          moderate: "#B78103",
          limited: "#C1591C",
          insufficient: "#8A8F98"
        }
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 27, 68, 0.04), 0 8px 24px rgba(16, 27, 68, 0.06)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
