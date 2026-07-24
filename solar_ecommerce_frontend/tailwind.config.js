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
          50:  '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d2',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#08a84a',
          700: '#0a8c3e',
          800: '#0b7035',
          900: '#0d5929',
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
