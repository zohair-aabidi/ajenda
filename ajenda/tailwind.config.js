/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-light': '#4F46E5',
        'primary-dark': '#6366F1',
      }
    },
  },
  plugins: [],
}

