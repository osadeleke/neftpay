import React from "react";
import { getSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/db/queries";
import { formatNaira } from "@/lib/utils";
import { AgreementCard } from "@/components/agreements/agreement-card";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Sparkles,
  CheckCircle2,
  PlusCircle,
  MessageCircle,
  Receipt,
  Store,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.id);
  const isBrandNewMerchant =
    stats.activeAgreementsCount === 0 && stats.completedAgreementsCount === 0;

  return (
    <div className="space-y-5">
      {/* Welcome & Merchant Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#00D084]">
            Merchant Dashboard
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">
            {session.business_name}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 dark:text-[#00D084]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Ledger</span>
        </div>
      </div>

      {/* Brand New Merchant Onboarding View */}
      {isBrandNewMerchant ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl hero-gradient p-6 text-white shadow-xl hero-glow-emerald border border-emerald-500/30">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-[#00D084] text-white shadow-md">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Welcome to NEFTrack!
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Your zero-marginal-cost installment ledger is active
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                Start tracking part-payments for phones, solar systems, electronics, or retail goods. No SMS fees—digital receipts are shared directly via WhatsApp.
              </p>

              <div className="pt-2">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0">
                      1
                    </span>
                    <span>Tap <strong>+</strong> button below to create your first agreement</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0">
                      2
                    </span>
                    <span>Enter customer name, phone & total price in ₦</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0">
                      3
                    </span>
                    <span>Instantly send customer their permanent WhatsApp Magic Link</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Card: Total Outstanding Balance */}
          <div className="relative overflow-hidden rounded-3xl hero-gradient p-6 text-white shadow-2xl hero-glow-emerald border border-emerald-500/25">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#00D084]/15 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Total Outstanding Balance
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {stats.activeAgreementsCount} active plans
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-white font-money">
                {formatNaira(stats.totalOutstandingBalanceKobo)}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span>
                  Expected across {stats.activeClientsCount} installment customers
                </span>
                <span className="text-[#00D084] font-bold">
                  Kobo Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* Two Summary Chips: "Collected This Month" & "Active Clients" */}
          <div className="grid grid-cols-2 gap-3">
            {/* Chip 1: Collected This Month */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#0F172A] transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Collected This Month
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-[#00D084]">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5 font-money">
                {formatNaira(stats.collectedThisMonthKobo, { compact: true })}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-[#00D084] font-medium mt-1 flex items-center gap-1">
                <span>₦ Bank & cash settlements</span>
              </div>
            </div>

            {/* Chip 2: Active Clients */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-slate-800/80 dark:bg-[#0F172A] transition-all hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Clients
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5 font-money">
                {stats.activeClientsCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                <span>Installment buyers</span>
              </div>
            </div>
          </div>

          {/* Actionable List: Overdue Agreements */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Overdue Agreements
                </h3>
                {stats.overdueAgreements.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                    {stats.overdueAgreements.length}
                  </span>
                )}
              </div>
              <Link
                href="/agreements?status=overdue"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-[#00D084] flex items-center gap-1"
              >
                <span>See all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {stats.overdueAgreements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center bg-white dark:bg-[#0F172A]/50">
                <CheckCircle2 className="h-8 w-8 text-[#00D084] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  All Installments On Schedule!
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No overdue balances detected at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.overdueAgreements.map((agreement) => (
                  <AgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    showQuickRemind={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity / Recent Agreements */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Installment Plans
              </h3>
              <Link
                href="/agreements"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-[#00D084] flex items-center gap-1"
              >
                <span>View Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {stats.recentAgreements.slice(0, 3).map((agreement) => (
                <AgreementCard
                  key={agreement.id}
                  agreement={agreement}
                  showQuickRemind={true}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
