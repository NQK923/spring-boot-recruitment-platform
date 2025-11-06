import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        muted: "var(--text-muted)",
        text: {
          DEFAULT: "var(--text)",
          strong: "var(--text-strong)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
          inverse: "var(--text-inverse)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          ghost: "var(--surface-ghost)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          divider: "var(--divider)",
        },
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
        },
        accent: {
          500: "var(--accent-500)",
          600: "var(--accent-600)",
        },
        success: {
          500: "var(--success-500)",
          600: "var(--success-600)",
        },
        warning: {
          500: "var(--warning-500)",
          600: "var(--warning-600)",
        },
        error: {
          500: "var(--error-500)",
          600: "var(--error-600)",
        },
        info: {
          500: "var(--info-500)",
          600: "var(--info-600)",
        },
        overlay: {
          hover: "var(--hover-overlay)",
          pressed: "var(--pressed-overlay)",
        },
      },
      boxShadow: {
        elev1: "var(--elev-1)",
        elev2: "var(--elev-2)",
        elev3: "var(--elev-3)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        pill: "9999px",
      },
      fontSize: {
        h1: ["clamp(2rem, 3.5vw, 2.75rem)", { lineHeight: "1.15", fontWeight: "800", letterSpacing: "-0.02em" }],
        h2: ["clamp(1.5rem, 2.6vw, 2rem)", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        body: ["1rem", { lineHeight: "1.7" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],
      },
      ringColor: { DEFAULT: "var(--focus)" },
    },
  },
  plugins: [],
};

export default config;
