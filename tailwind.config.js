const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      spacing: {
        1: '1px',
      },
      colors: {
        'highlight-light': colors.rose[200],
        highlight: colors.rose[300],
        'highlight-!': colors.rose[400],
        'highlight-deep': colors.rose[600],
        'highlight-dark': colors.rose[900],

        default: colors.gray,
      },
    },
  },
  plugins: [],
};
