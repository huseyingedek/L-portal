/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kurumsal tema renkleri
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d6fd',
          300: '#a5b9fb',
          400: '#8094f8',
          500: '#6374f3',
          600: '#4f57e8',
          700: '#4044cf',
          800: '#3538a7',
          900: '#313484',
          950: '#1e1f50',
        },
        // Lüks tema için altın tonları
        gold: {
          300: '#fcd37a',
          400: '#f9bc41',
          500: '#f0a01d',
          600: '#d4820f',
          700: '#b06309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
