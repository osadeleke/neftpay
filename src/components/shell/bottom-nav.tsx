"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard" || pathname === "/",
    },
    {
      name: "Ledger",
      href: "/agreements",
      icon: BookOpen,
      active: pathname.startsWith("/agreements"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md border-t border-slate-200/70 bg-white/90 px-6 py-2.5 pb-safe backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0B111E]/95 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-4 transition-all duration-200",
                tab.active
                  ? "text-emerald-700 dark:text-[#00D084] font-bold"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 font-medium"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-200",
                  tab.active
                    ? "bg-emerald-500/15 dark:bg-[#00D084]/20 scale-105"
                    : "bg-transparent"
                )}
              >
                <Icon className={cn("h-5 w-5", tab.active ? "stroke-[2.5]" : "stroke-[1.8]")} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-semibold">{tab.name}</span>
              {tab.active && (
                <span className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-emerald-500 to-[#00D084] shadow-sm shadow-emerald-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
