/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ti: {
          bg: "#0B0F19",
          card: "#111827",
          border: "#1F2937",
          accent: "#3B82F6",
          gold: "#F59E0B",
          success: "#10B981",
        }
      }
    },
  },
  plugins: [],
}
