/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        paper: "#faf7f1",
        gold: "#c89b5c",
        "gold-deep": "#a87836",
        sky: "#6aa9c9",
      },
      fontFamily: {
        serif: ['"Fraunces"', "serif"],
        sans: ['"Inter"', "sans-serif"],
        bangla: ['"Hind Siliguri"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
