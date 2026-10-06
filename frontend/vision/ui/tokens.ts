// Design tokens for Orchid Vision Preview

export const TOKENS = {
  colors: {
    ink: "#0B1020",
    ink2: "#141A47",
    surface: "#111827",
    surface2: "#0F1629",
    border: "#1E2A45",
    borderHover: "#2E3F66",
    ivoryText: "#F0EDE4",
    mutedText: "#94A3B8",
    amber: "#F59E0B",
    amberDim: "rgba(245, 158, 11, 0.15)",
    teal: "#0D9488",
    tealDim: "rgba(13, 148, 136, 0.15)",
    high: "#10B981",
    med: "#F59E0B",
    low: "#EF4444",
  },
  chips: {
    built: {
      bg: "rgba(13, 148, 136, 0.15)",
      border: "rgba(13, 148, 136, 0.4)",
      text: "#2DD4BF",
      label: "Built today",
    },
    built_simplified: {
      bg: "rgba(59, 130, 246, 0.15)",
      border: "rgba(59, 130, 246, 0.4)",
      text: "#60A5FA",
      label: "Built (simplified today)",
    },
    backend_planned: {
      bg: "rgba(99, 102, 241, 0.15)",
      border: "rgba(99, 102, 241, 0.4)",
      text: "#A5B4FC",
      label: "Backend built / UI planned",
    },
    planned: {
      bg: "rgba(71, 85, 105, 0.2)",
      border: "rgba(71, 85, 105, 0.4)",
      text: "#94A3B8",
      label: "Planned",
    },
  },
  typography: {
    display: "var(--font-display), Georgia, serif",
    ui: "var(--font-ui), ui-sans-serif, system-ui, sans-serif",
    mono: "var(--font-mono), ui-monospace, Menlo, monospace",
  },
};
