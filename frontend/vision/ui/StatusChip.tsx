import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { StatusChipType } from "../mock/types";

interface StatusChipProps {
  type: StatusChipType;
  customLabel?: string;
  tooltipText?: string;
  className?: string;
}

const CHIP_CONFIG: Record<
  StatusChipType,
  { label: string; bg: string; border: string; text: string; defaultTooltip?: string }
> = {
  built: {
    label: "Built today",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    text: "text-teal-300",
    defaultTooltip: "Active in the running repository today. Clickable and verified on live local infrastructure.",
  },
  built_simplified: {
    label: "Built (simplified today)",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-300",
    defaultTooltip: "A working prototype exists in the live app, but operates on in-memory sample records rather than full cluster scale.",
  },
  backend_planned: {
    label: "Backend built / UI planned",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-300",
    defaultTooltip: "Core algorithms, database schemas, or ingestion scripts exist in backend/, but dedicated frontend view is planned.",
  },
  planned: {
    label: "Planned",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
    text: "text-slate-400",
    defaultTooltip: "Concept preview of roadmap feature for investor demonstration.",
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  type,
  customLabel,
  tooltipText,
  className = "",
}) => {
  const config = CHIP_CONFIG[type];
  const label = customLabel || config.label;
  const tooltip = tooltipText || config.defaultTooltip;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border transition-all cursor-help focus:outline-none focus:ring-1 focus:ring-amber-400 ${config.bg} ${config.border} ${config.text} ${className}`}
            aria-label={`${label}: ${tooltip}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                type === "built"
                  ? "bg-teal-400"
                  : type === "built_simplified"
                  ? "bg-blue-400"
                  : type === "backend_planned"
                  ? "bg-indigo-400"
                  : "bg-slate-500"
              }`}
            />
            <span>{label}</span>
            {type === "built_simplified" && <Info className="w-3 h-3 opacity-70" />}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={4}
            className="z-50 max-w-xs px-3 py-1.5 text-[11px] font-sans text-slate-200 bg-slate-900 border border-slate-700 rounded-lg shadow-xl animate-fade-in"
          >
            {tooltip}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default StatusChip;
