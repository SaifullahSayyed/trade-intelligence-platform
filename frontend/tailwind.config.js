/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Vision preview routes & components
    "./vision/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Existing live-app tokens (NEVER rename/remove) ─────────────────────
      colors: {
        ti: {
          bg:      "#0B0F19",
          card:    "#111827",
          border:  "#1F2937",
          accent:  "#3B82F6",
          gold:    "#F59E0B",
          success: "#10B981",
        },
        // ── Vision-only tokens (v.* namespace) ──────────────────────────────
        v: {
          ink:        "#0B1020",
          ink2:       "#141A47",
          surface:    "#111827",
          surface2:   "#0F1629",
          border:     "#1E2A45",
          ivoryText:  "#F0EDE4",
          mutedText:  "#94A3B8",
          amber:      "#F59E0B",
          amberDim:   "#78350F",
          teal:       "#0D9488",
          tealDim:    "#134E4A",
          // Confidence tier
          high:       "#10B981",
          highBg:     "#064E3B",
          med:        "#F59E0B",
          medBg:      "#78350F",
          low:        "#EF4444",
          lowBg:      "#7F1D1D",
          // Status chips
          chipBuilt:  "#0D9488",
          chipSimp:   "#3B82F6",
          chipBack:   "#6366F1",
          chipPlan:   "#475569",
        },
      },
      // ── Vision typography (font vars from next/font CSS variables) ──────────
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui:      ["var(--font-ui)",      "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)",    "ui-monospace", "Menlo", "monospace"],
      },
      // ── Vision animation tokens ─────────────────────────────────────────────
      animation: {
        "fade-in":    "fadeIn 0.25s ease-out both",
        "slide-up":   "slideUp 0.3s ease-out both",
        "slide-right":"slideRight 0.25s ease-out both",
        "ping-slow":  "ping 2s cubic-bezier(0,0,0.2,1) infinite",
      },
      keyframes: {
        fadeIn:     { "0%": { opacity: "0" },                      "100%": { opacity: "1" } },
        slideUp:    { "0%": { opacity: "0", transform: "translateY(8px)" },  "100%": { opacity: "1", transform: "translateY(0)" } },
        slideRight: { "0%": { opacity: "0", transform: "translateX(-8px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
      },
      // ── Hairline glass border ───────────────────────────────────────────────
      boxShadow: {
        "glass":      "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)",
        "glass-hover":"inset 0 1px 0 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6)",
        "amber-glow": "0 0 20px rgba(245,158,11,0.25)",
        "teal-glow":  "0 0 20px rgba(13,148,136,0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
