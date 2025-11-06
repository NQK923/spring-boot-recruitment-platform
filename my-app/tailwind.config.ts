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
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--text-muted)",
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
      },
      ringColor: {
        DEFAULT: "var(--focus)",
      },
    },
  },
  plugins: [],
};

export default config;
