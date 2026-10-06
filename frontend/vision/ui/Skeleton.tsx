import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
);

export const CardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-black/40 border border-[#1E2A45] space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-8 w-36" />
    <Skeleton className="h-3 w-48" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    <Skeleton className="h-9 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export default Skeleton;
