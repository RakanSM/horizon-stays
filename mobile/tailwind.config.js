/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        horizon: {
          bg: '#0c0a08',
          panel: '#141210',
          gold: '#c9a96e',
          text: '#f5f0e8',
        },
      },
    },
  },
  plugins: [],
};
