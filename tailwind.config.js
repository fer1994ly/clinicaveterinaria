/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        clinic: { DEFAULT: '#7FC7D9', soft: '#E8F5F9', dark: '#2F7F94' },
        health: { DEFAULT: '#6FAE7B', dark: '#3E7A4B', soft: '#E9F4EB' },
        ink: { DEFAULT: '#1B2A2E', soft: '#4A5B60' },
        warn: { DEFAULT: '#E0A526', dark: '#7A5800', soft: '#FFF6DD' },
        danger: { DEFAULT: '#D64545', dark: '#A62B2B', soft: '#FDECEC' },
      },
      fontFamily: {
        heading: ['Nunito', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,42,46,0.06), 0 4px 14px rgba(27,42,46,0.06)',
      },
    },
  },
  plugins: [],
}
