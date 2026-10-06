import React from "react";

interface VisionBadgeProps {
  className?: string;
}

export const VisionBadge: React.FC<VisionBadgeProps> = ({ className = "" }) => {
  return (
    <div
      role="status"
      aria-label="Product Vision Preview — Illustrative Mock Data"
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[11px] tracking-wide select-none shadow-[0_0_12px_rgba(245,158,11,0.15)] ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span className="font-semibold uppercase tracking-wider text-amber-300">
        PRODUCT VISION PREVIEW — ILLUSTRATIVE MOCK DATA
      </span>
    </div>
  );
};

export default VisionBadge;
