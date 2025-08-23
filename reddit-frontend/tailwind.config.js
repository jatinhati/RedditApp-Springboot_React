/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'reddit-orange': '#FF4500',
        'reddit-blue': '#0079D3',
        'reddit-dark': '#1A1A1B',
        'reddit-gray': '#878A8C',
        'reddit-lightgray': '#DAE0E6',
        'reddit-background': '#F6F7F8'
      }
    },
  },
  plugins: [],
}