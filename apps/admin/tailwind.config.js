/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#2563eb', // Brand Primary
          700: '#1d4ed8',
        },
        slate: {
          50: '#f8fafc',  // Background
          100: '#f1f5f9',
          200: '#e2e8f0', // Border
          400: '#9ca3af', // Helper text
          600: '#475569', // Body text
          800: '#1e293b', // Table text
          900: '#0f172a', // Title text
        },
        success: '#10b981', // emerald-500
        warning: '#f59e0b', // amber-500
        error: '#ef4444',   // red-500
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}
