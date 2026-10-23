import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  indicatorColor?: string;
}

export function ProgressBar({
  value,
  className,
  indicatorColor = "bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00D084]",
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value || 0));

  return (
    <div
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/80 p-0.5",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-700 ease-out rounded-full shadow-sm",
          indicatorColor
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
