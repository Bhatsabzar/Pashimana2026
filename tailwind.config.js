/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.js', './src/**/*.jsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          50: '#fdfcfa',
          100: '#faf7f2',
          200: '#f3ebe0',
          300: '#e8dcc8',
        },
        ink: {
          DEFAULT: '#1c1917',
          muted: '#57534e',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(28, 25, 23, 0.08), 0 2px 8px -2px rgba(28, 25, 23, 0.06)',
        'card-hover':
          '0 20px 40px -12px rgba(28, 25, 23, 0.12), 0 8px 16px -6px rgba(28, 25, 23, 0.08)',
      },
    },
  },
  plugins: [],
}
