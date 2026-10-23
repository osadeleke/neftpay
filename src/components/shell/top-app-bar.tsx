"use client";

import React, { useState } from "react";
import { Bell, Store, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

interface TopAppBarProps {
  businessName?: string;
  unreadCount?: number;
}

export function TopAppBar({
  businessName = "Your Business",
  unreadCount = 0,
}: TopAppBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#0B111E]/90">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#00D084] text-white shadow-md shadow-emerald-600/25">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">
                {businessName}
              </span>
              <ShieldCheck className="h-4 w-4 text-[#00D084] shrink-0" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-[#00D084]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified SME Store</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0F172A] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          />
          <div className="relative z-50 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A] animate-in fade-in slide-in-from-top-4 duration-200 mt-12">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600 dark:text-[#00D084]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifications & Alerts
                </h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-[#00D084]">
                  <span>System Active</span>
                  <span>Now</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                  Your WhatsApp digital receipt pipeline is active and ready.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
