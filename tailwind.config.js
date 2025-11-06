/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0a84ff',
        'brand-green': '#30d158',
        'brand-yellow': '#ffd60a',
        'brand-orange': '#ff9f0a',
        'brand-red': '#ff453a',
        'brand-purple': '#bf5af2',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 60s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'slide-out': 'slideOut 0.5s ease-out forwards',
        'arc-flow': 'arcFlow 2s linear infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-down': 'slideDown 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'rot': 'rot 1s linear infinite',
        'gradient': 'gradient 15s ease infinite',
        'rain': 'makeItRain 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        arcFlow: {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(100%)', opacity: 0 },
        },
        rot: {
          'from': { transform: 'rotate(-100deg)' },
          'to': { transform: 'rotate(180deg)' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        makeItRain: {
          '0%': { opacity: 0, transform: 'translateY(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateY(400px)' },
        },
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
    }
  },
  plugins: [],
}
