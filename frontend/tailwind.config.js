/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary: '#81C784',
        light: '#DDEDE6',
        secondary: '#C7CEEA',
        highlight: '#FFF176',
        background: '#FDF7F3',
        text: '#424242',
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px,1fr))'
      }
    },
  },
  plugins: [],
}