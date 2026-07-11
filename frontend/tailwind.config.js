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
        completed: '#10b981',
        pending: '#f59e0b',
        missed: '#ef4444',
        locked: '#64748b',
      }
    },
  },
  plugins: [],
}
