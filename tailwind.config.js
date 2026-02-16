/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f0f',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        coral: '#e8837c',
        'coral-hover': '#f09990',
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        muted: '#a3a3a3',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
