/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0f1a2e",
        "navy-light": "#1a2744",
        "navy-lighter": "#1e3a5f",
        accent: "#3b82f6",
      },
    },
  },
  plugins: [],
};
