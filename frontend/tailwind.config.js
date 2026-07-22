/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: "#0F172A",
          secondary: "#1E293B",
          cards: "#111827",
          text: "#F8FAFC",
          accent: "#0EA5E9",
          border: "rgba(255, 255, 255, 0.08)",
          warning: "#FACC15",
          critical: "#EF4444",
          safe: "#22C55E",
          info: "#38BDF8"
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cyber: '0 0 20px rgba(14, 165, 233, 0.15)',
        'cyber-red': '0 0 20px rgba(239, 68, 68, 0.25)',
        'cyber-green': '0 0 20px rgba(34, 197, 94, 0.25)',
        glass: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
