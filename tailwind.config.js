/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-3': 'rgb(230, 232, 235)',
        'accent-6': 'rgb(79, 172, 254)',
        'accent-9': 'rgb(13, 148, 136)',
        'accent-11': 'rgb(17, 24, 39)',
        'accent-secondary-6': 'rgb(251, 146, 60)',
        'neutral-2': 'rgb(248, 250, 252)',
        'fg-secondary': 'rgb(100, 116, 139)'
      }
    },
  },
  plugins: [],
}
