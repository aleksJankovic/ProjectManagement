/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter']
      },
      colors: {
        "accent-blue": "#0E2954",
        "background": "#EBF3FF"
      },
      screens: {
        'sm': '600px'
      }
    },
  },
}

