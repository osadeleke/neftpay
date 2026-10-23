import React from "react";
import { TopAppBar } from "@/components/shell/top-app-bar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { GlobalFAB } from "@/components/shell/global-fab";
import { getSession } from "@/lib/auth/session";
import { seedDemoDataIfNeeded } from "@/lib/db/seed";


import { redirect } from "next/navigation";

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-900/10 dark:bg-[#070B12] flex flex-col justify-start items-center">
      {/* Mobile-first viewport wrapper: Centered max-w-md on desktop, full-width on mobile */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-[#0B111E] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.15)] border-x border-slate-200/60 dark:border-slate-800/80 pb-24">
        {/* Top App Bar */}
        <TopAppBar
          businessName={session.business_name}
          unreadCount={0}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5">{children}</main>

        {/* Global Floating Action Button */}
        <GlobalFAB />

        {/* Fixed Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
