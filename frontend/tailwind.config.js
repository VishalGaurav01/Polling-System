// frontend/tailwind.config.js
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
        // Light theme colors
        primary: {
          light: '#EEF2FF', // indigo-50
          DEFAULT: '#6366F1', // indigo-500
          dark: '#4F46E5', // indigo-600
        },
        // Dark theme specific colors
        dark: {
          bg: '#121212',
          surface: '#1E1E1E',
          border: '#333333',
          text: '#E0E0E0',
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'fade-out-down': 'fadeOutDown 0.3s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        fadeOutDown: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(20px)' }
        }
      }
    },
  },
  plugins: [],
}