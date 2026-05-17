/** @type {import('tailwindcss').Config} */
// Force Vite rebuild
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#14B8A6",
        background: "var(--bg-background)",
        card: "var(--bg-card)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-color": "var(--border-color)",
        alert: "#EF4444",
        success: "#22C55E",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
