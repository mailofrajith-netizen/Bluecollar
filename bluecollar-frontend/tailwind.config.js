export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0eb',
        navy: '#1a1f2e',
        'navy-dark': '#0a0e1a',
        accent: '#e8722a',
        brand: { bg: '#f5f0eb', dark: '#1a1a1a' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
