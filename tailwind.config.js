const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        highlight: colors.rose,
        default: colors.gray,
      },
    },
  },
  plugins: [],
};
