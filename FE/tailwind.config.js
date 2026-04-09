/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#00f2ff',
        'brand-teal': '#10b981',
        'brand-purple': '#9333ea',
        'cyber-black': '#05080e',
        'cyber-navy': '#0a0e17',
        'neon-blue': '#00b4ff',
        'neon-green': '#39ff14',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s linear infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 0.5, filter: 'blur(10px)' },
          '50%': { opacity: 1, filter: 'blur(15px)' },
        },
        'scan': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        }
      }
    },
  },
  plugins: [],
}