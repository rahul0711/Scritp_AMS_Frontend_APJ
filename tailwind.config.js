/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#0D3B8E",   // deep navy
          700: "#1451B8",   // royal blue
          500: "#1E6FE8",   // bright blue
          100: "#E8EFFE",   // very light blue bg
          50:  "#EBF2FF",
        },
      },
    },
  },
  plugins: [],
};