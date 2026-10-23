import React from "react";
import { isAdminAuthenticated, logoutAdminAction } from "@/actions/admin";
import { getAdminPlatformMetrics } from "@/lib/db/queries";
import { formatNaira, formatFriendlyDateTime } from "@/lib/utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Wallet,
  TrendingUp,
  Users,
  Store,
  FileText,
  CreditCard,
  LogOut,
  Landmark,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const metrics = await getAdminPlatformMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start items-center p-4 sm:p-6 pb-20">
      <div className="w-full max-w-4xl space-y-6">
        {/* Admin Navigation Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white tracking-tight">
                  NEFTrack Super-Admin
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                  Global Metrics
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ecosystem-wide installment SaaS performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-emerald-400" />
              <span>Merchant App</span>
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </button>
            </form>
          </div>
        </header>

        {/* 3 Top Financial Metric Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Money Tracked */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-amber-400" />
                Total Volume Tracked
              </span>
              <span className="text-[10px] text-amber-400 font-mono">GMV</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              {formatNaira(metrics.totalVolumeTrackedKobo)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Combined value of all agreements created
            </p>
          </div>

          {/* Card 2: Total Money Received */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 p-5 shadow-lg relative overflow-hidden border-emerald-900/40">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Total Cash Received
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Settled</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2 tracking-tight">
              {formatNaira(metrics.totalCollectedKobo)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Successfully paid across {metrics.totalPaymentsCount} installments
            </p>
          </div>

          {/* Card 3: Total Outstanding */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Active Market Balance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Outstanding</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              {formatNaira(metrics.totalOutstandingKobo)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pending installment collection in market
            </p>
          </div>
        </div>

        {/* Ecosystem Scale Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">SME Merchants</span>
              <Store className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {metrics.totalMerchantsCount}
            </div>
            <span className="text-[10px] text-slate-500">Registered stores</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Total Clients</span>
              <Users className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {metrics.totalClientsCount}
            </div>
            <span className="text-[10px] text-slate-500">Installment buyers</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Agreements</span>
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {metrics.totalAgreementsCount}
            </div>
            <span className="text-[10px] text-slate-500">Contracts active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase">Payments</span>
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {metrics.totalPaymentsCount}
            </div>
            <span className="text-[10px] text-slate-500">Installments logged</span>
          </div>
        </div>

        {/* Section 1: Registered SME Merchants Directory */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Registered SME Merchants ({metrics.merchants.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Multi-tenant stores</span>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.merchants.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{m.business_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-semibold border border-emerald-800">
                      {m.subscription_tier}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Phone: <strong className="text-slate-300 font-mono">{m.phone_number}</strong></span>
                    <span>Email: <strong className="text-slate-300">{m.email}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Tracked</div>
                    <div className="text-xs font-bold text-white">
                      {formatNaira(m.total_tracked_kobo)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-500 uppercase">Collected</div>
                    <div className="text-xs font-black text-emerald-400">
                      {formatNaira(m.total_collected_kobo)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Plans</div>
                    <div className="text-xs font-semibold text-slate-300">
                      {m.agreements_count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Global Recent Installment Payments */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Live Ecosystem Installment Stream
              </h3>
            </div>
            <span className="text-xs text-slate-400">Real-time ledger updates</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {metrics.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No payments logged yet.
              </p>
            ) : (
              metrics.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 font-bold shrink-0">
                      ₦
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {formatNaira(p.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        From <strong>{p.client_name}</strong> for <em>{p.agreement_title}</em>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
                      {p.merchant_business_name}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {formatFriendlyDateTime(p.created_at)} • {p.payment_method}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
