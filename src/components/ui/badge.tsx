import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "overdue" | "completed" | "outline" | "whatsapp" | "amber";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default:
      "bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60",
    active:
      "bg-emerald-500/10 text-emerald-800 dark:text-[#00D084] border-emerald-500/30 font-bold",
    overdue:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-bold animate-pulse-slow",
    completed:
      "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 font-bold",
    amber:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-bold",
    outline:
      "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
    whatsapp:
      "bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] border-[#25D366]/40 font-bold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] transition-all focus:outline-none tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
