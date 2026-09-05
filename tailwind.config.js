/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          50: '#f5f3f7',
          100: '#eae5ef',
          200: '#d7cdde',
          300: '#bca8c8',
          400: '#9b7ba9',
          500: '#714b67', // Odoo Primary Purple
          600: '#643f5a',
          700: '#533249',
          800: '#432a3b',
          900: '#392432',
        },
        teal: {
          500: '#00a09d', // Odoo Secondary Teal
          600: '#008784',
        }
      },
    },
  },
  plugins: [],
}
