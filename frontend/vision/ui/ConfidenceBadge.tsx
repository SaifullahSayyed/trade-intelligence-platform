import React from "react";
import { ConfidenceTier } from "../mock/types";

interface ConfidenceBadgeProps {
  tier: ConfidenceTier;
  score?: number;
  className?: string;
  showScore?: boolean;
}

const TIER_CONFIG: Record<
  ConfidenceTier,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  HIGH: {
    label: "HIGH CONFIDENCE",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    label: "MEDIUM (REVIEW)",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-300",
    dot: "bg-amber-400",
  },
  LOW: {
    label: "LOW CONFIDENCE",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  tier,
  score,
  className = "",
  showScore = true,
}) => {
  const config = TIER_CONFIG[tier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75">· {(score * 100).toFixed(1)}%</span>
      )}
    </span>
  );
};

export default ConfidenceBadge;
