/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkGreen: '#0a3a2a',
        lightGreen: '#126146',
        gold: '#d4af37',
      }
    },
  },
  plugins: [],
}
