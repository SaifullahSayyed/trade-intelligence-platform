import React from "react";

interface MockLabelProps {
  className?: string;
  size?: "xs" | "sm";
}

export const MockLabel: React.FC<MockLabelProps> = ({ className = "", size = "xs" }) => {
  const sizeClass = size === "xs" ? "text-[9px] px-1.5 py-0.2" : "text-[10px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono font-semibold uppercase tracking-wider select-none ${sizeClass} ${className}`}
      title="This record is fabricated for demonstration purposes only"
    >
      [MOCK]
    </span>
  );
};

export default MockLabel;
