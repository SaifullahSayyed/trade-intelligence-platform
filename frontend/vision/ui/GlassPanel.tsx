import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hairlineAccent?: "amber" | "teal" | "indigo" | "none";
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = "",
  hairlineAccent = "none",
  hoverEffect = false,
  padding = "md",
}) => {
  const paddingClass = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  }[padding];

  const accentBorder = {
    none: "",
    amber: "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-amber-500/60 before:to-transparent",
    teal: "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-teal-500/60 before:to-transparent",
    indigo: "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-indigo-500/60 before:to-transparent",
  }[hairlineAccent];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f172a]/85 via-[#0b1020]/90 to-[#070b14]/95 border border-[#1E2A45] backdrop-blur-xl shadow-glass ${
        hoverEffect
          ? "hover:border-[#2E3F66] hover:shadow-glass-hover transition-all duration-300"
          : ""
      } ${accentBorder} ${paddingClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
