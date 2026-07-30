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
        primary: {
          50: '#fffbe style',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B', // Primary requested: #F59E0B
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#F59E0B',
        },
        secondary: {
          DEFAULT: '#FFF7ED', // Secondary requested: #FFF7ED
          dark: '#332719',
        },
        success: {
          DEFAULT: '#22C55E', // Success requested: #22C55E
          light: '#dcfce7',
          dark: '#14532d',
        },
        danger: {
          DEFAULT: '#EF4444', // Danger requested: #EF4444
          light: '#fee2e2',
          dark: '#7f1d1d',
        },
        info: {
          DEFAULT: '#3B82F6', // Info requested: #3B82F6
          light: '#dbeafe',
          dark: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
