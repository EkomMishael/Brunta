/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  darkMode: 'media',
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

