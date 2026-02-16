/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050810', // Dark eyes from lobster
        surface: '#0f1419',
        border: '#1f2937',
        claw: '#ff4d4d', // Primary red from gradient
        'claw-dark': '#991b1b', // Dark red from gradient
        'claw-glow': '#ff6666',
        cyan: '#00e5cc', // Eye highlights
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        muted: '#6b7280',
        'terminal-green': '#00ff41',
        'pixel-blue': '#4d9de0',
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'scan-lines': 'scan-lines 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'typewriter': 'typewriter 3s steps(20) 1s forwards',
        'claw-walk': 'claw-walk 8s linear infinite',
        'terminal-cursor': 'terminal-cursor 1s step-end infinite',
      },
      keyframes: {
        'scan-lines': {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '10%': { transform: 'translate(-2px, 2px)' },
          '20%': { transform: 'translate(-2px, -2px)' },
          '30%': { transform: 'translate(2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '50%': { transform: 'translate(-2px, 2px)' },
          '60%': { transform: 'translate(-2px, -2px)' },
          '70%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(-2px, -2px)' },
          '90%': { transform: 'translate(2px, 2px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,77,77,0.4)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(255,77,77,0.2)', transform: 'scale(1.02)' }
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        'claw-walk': {
          '0%': { transform: 'translateX(-100px) scaleX(1)' },
          '45%': { transform: 'translateX(45%) scaleX(1)' },
          '50%': { transform: 'translateX(50%) scaleX(-1)' },
          '95%': { transform: 'translateX(calc(100% + 100px)) scaleX(-1)' },
          '100%': { transform: 'translateX(calc(100% + 100px)) scaleX(-1)' }
        },
        'terminal-cursor': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        }
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      }
    },
  },
  plugins: [],
}
