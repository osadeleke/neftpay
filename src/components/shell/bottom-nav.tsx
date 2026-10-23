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
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md border-t border-slate-200/90 bg-white/95 px-6 py-2 pb-safe backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/95 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                  tab.active
                    ? "bg-emerald-50 dark:bg-emerald-950/60 scale-105"
                    : "bg-transparent"
                )}
              >
                <Icon className={cn("h-5 w-5", tab.active ? "stroke-[2.5]" : "stroke-[1.75]")} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.name}</span>
              {tab.active && (
                <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
