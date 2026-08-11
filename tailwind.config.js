/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        critical: '#DC2626',
        high: '#EA580C',
        medium: '#EAB308',
        low: '#3B82F6',
        info: '#6B7280',
      },
    },
  },
  plugins: [],
}
