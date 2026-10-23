import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function ProgressBar({
  value,
  className,
  indicatorColor = "bg-emerald-500",
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-500 ease-out rounded-full", indicatorColor)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
