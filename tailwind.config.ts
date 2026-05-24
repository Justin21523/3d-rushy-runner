/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hud-primary': '#00ffcc',   // Neon Cyan for main UI elements
        'hud-secondary': '#ff0055', // Neon Pink for warnings/enemies
        'hud-bg': 'rgba(10, 10, 15, 0.8)',
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}