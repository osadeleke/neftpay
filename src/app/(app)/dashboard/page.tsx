import React from "react";
import { getSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/db/queries";
import { formatNaira } from "@/lib/utils";
import { AgreementCard } from "@/components/agreements/agreement-card";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Wallet,
  Sparkles,
  CheckCircle2,
} from "lucide-react";


export default async function DashboardPage() {
  const session = await getSession();
  const merchantId = session?.id || "mer_adebayo_ikeja_01";
  const stats = await getDashboardStats(merchantId);

  return (
    <div className="space-y-5">
      {/* Welcome & Merchant Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Installment performance overview
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SME Tier: Free</span>
        </div>
      </div>

      {/* Hero Card: Total Outstanding Balance */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900/50">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-500/15 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Total Outstanding Balance
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {stats.activeAgreementsCount} active plans
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-white">
            {formatNaira(stats.totalOutstandingBalanceKobo)}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Expected from {stats.activeClientsCount} installment customers
            </span>
            <span className="text-emerald-400 font-semibold">
              Live Ledger
            </span>
          </div>
        </div>
      </div>

      {/* Two Summary Chips: "Collected This Month" & "Active Clients" */}
      <div className="grid grid-cols-2 gap-3">
        {/* Chip 1: Collected This Month */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Collected This Month
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {formatNaira(stats.collectedThisMonthKobo, { compact: true })}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>₦ Received in bank/cash</span>
          </div>
        </div>

        {/* Chip 2: Active Clients */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Clients
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
            {stats.activeClientsCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            <span>Part-payment buyers</span>
          </div>
        </div>
      </div>

      {/* Actionable List: Overdue Agreements */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Overdue Agreements
            </h3>
            {stats.overdueAgreements.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {stats.overdueAgreements.length}
              </span>
            )}
          </div>
          <Link
            href="/agreements?status=overdue"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
          >
            <span>See all</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.overdueAgreements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center bg-white dark:bg-slate-900/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
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
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
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
    </div>
  );
}
