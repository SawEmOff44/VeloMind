/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        velo: {
          cyan: '#06b6d4',
          'cyan-light': '#22d3ee',
          'cyan-dark': '#0891b2',
          blue: '#0284c7',
          'blue-light': '#0ea5e9',
          'blue-dark': '#0369a1',
          green: '#10b981',
          'green-light': '#34d399',
          'green-dark': '#059669',
          teal: '#14b8a6',
          'teal-light': '#2dd4bf',
          'teal-dark': '#0d9488',
        }
      },
      backgroundImage: {
        'velo-gradient': 'linear-gradient(135deg, #0891b2 0%, #0284c7 25%, #14b8a6 50%, #10b981 100%)',
        'velo-gradient-reverse': 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0284c7 75%, #0891b2 100%)',
      }
    },
  },
  plugins: [],
}
