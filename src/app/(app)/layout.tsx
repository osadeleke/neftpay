import React from "react";
import { TopAppBar } from "@/components/shell/top-app-bar";
import { BottomNav } from "@/components/shell/bottom-nav";
import { GlobalFAB } from "@/components/shell/global-fab";
import { getSession } from "@/lib/auth/session";
import { seedDemoDataIfNeeded } from "@/lib/db/seed";


export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure demo data is available
  await seedDemoDataIfNeeded();
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-start items-center">
      {/* Mobile-first viewport wrapper: Centered max-w-md on desktop, full-width on mobile */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col relative shadow-2xl border-x border-slate-200/80 dark:border-slate-800 pb-24">
        {/* Top App Bar */}
        <TopAppBar
          businessName={session?.business_name || "Adebayo Electronics & Solar"}
          unreadCount={1}
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
