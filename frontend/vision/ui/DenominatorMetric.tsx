import React from "react";
import { ExternalLink } from "lucide-react";

interface DenominatorMetricProps {
  label: string;
  numerator: number | string;
  denominator: number | string;
  unit?: string;
  timestampType?: string;
  timestampValue?: string;
  onClickEvidence?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const DenominatorMetric: React.FC<DenominatorMetricProps> = ({
  label,
  numerator,
  denominator,
  unit = "",
  timestampType = "Data Window",
  timestampValue = "Q3 2024 Illustrative Sample",
  onClickEvidence,
  className = "",
  size = "md",
}) => {
  const isClickable = !!onClickEvidence;

  return (
    <div
      onClick={isClickable ? onClickEvidence : undefined}
      className={`group relative p-3 sm:p-4 rounded-xl bg-black/40 border border-[#1E2A45] ${
        isClickable
          ? "cursor-pointer hover:border-amber-500/40 hover:bg-black/60 transition-all duration-200"
          : ""
      } ${className}`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickEvidence();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 gap-2">
        <span className="truncate">{label}</span>
        {isClickable && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            Evidence <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-mono min-w-0">
        <span
          className={`font-bold text-white tracking-tight ${
            size === "lg" ? "text-xl sm:text-2xl lg:text-3xl" : size === "md" ? "text-lg sm:text-xl lg:text-2xl" : "text-base"
          }`}
        >
          {typeof numerator === "number" ? numerator.toLocaleString("en-US") : numerator}
        </span>
        <span className="text-slate-400 text-xs sm:text-sm font-medium shrink-0">
          of {typeof denominator === "number" ? denominator.toLocaleString("en-US") : denominator}
        </span>
        {unit && <span className="text-slate-400 text-xs shrink-0">{unit}</span>}
      </div>

      <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
        <span className="shrink-0">{timestampType}:</span>
        <span className="text-slate-400 truncate text-right">{timestampValue}</span>
      </div>
    </div>
  );
};

export default DenominatorMetric;
