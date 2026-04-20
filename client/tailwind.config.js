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
        // Kenya flag-inspired brand colors
        brand: {
          red: '#bb0000',
          green: '#006600',
          black: '#000000',
          50: '#fff5f5',
          100: '#fee2e2',
          600: '#bb0000',
          700: '#9b0000',
          800: '#7b0000',
        },
      },
    },
  },
  plugins: [],
};
