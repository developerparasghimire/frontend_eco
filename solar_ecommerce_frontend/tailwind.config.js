/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        brand: {
          50:  '#fff8eb',
          100: '#ffeac4',
          200: '#ffd482',
          300: '#ffba47',
          400: '#ffa71e',
          500: '#f98a07',
          600: '#dd6802',
          700: '#b74a06',
          800: '#943a0d',
          900: '#7a310f',
        },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
};
