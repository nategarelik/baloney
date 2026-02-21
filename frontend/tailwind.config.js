/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Baloney brand palette
        base: "#f0e6ca",
        "base-dark": "#e6d9b8",
        primary: "#d4456b",
        "primary-light": "rgba(212, 69, 107, 0.15)",
        secondary: "#4a3728",
        "secondary-light": "rgba(74, 55, 40, 0.10)",
        accent: "#e8c97a",
        "accent-light": "rgba(232, 201, 122, 0.25)",
        // Legacy (kept for existing dashboard/feed pages)
        navy: "#0f1a2e",
        "navy-light": "#1a2744",
        "navy-lighter": "#1e3a5f",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
