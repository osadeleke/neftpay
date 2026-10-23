import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageCircle,
  Receipt,
  Mail,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default async function HomePage() {
  // If merchant is already authenticated, jump straight to their live dashboard
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-white selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Top Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070B12]/80 border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#00D084] text-white shadow-lg shadow-emerald-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">
                NEFTrack
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                Fintech for Nigerian SMEs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login?tab=login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?tab=register"
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <span>Register Store</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center relative overflow-hidden flex-1 flex flex-col justify-center">
        {/* Radiant Ambient Jade Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            <span>Zero Marginal Cost Part-Payment Tracking</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Log Customer Installments.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00D084] to-teal-300">
              Share Receipts via WhatsApp & Email.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate expensive SMS aggregator fees. Track customer part-payments in Naira (₦),
            monitor balances in real-time, and automatically send read-only verified digital receipts.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/login?tab=register"
              className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Create Free Store Ledger</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/login?tab=login"
              className="w-full sm:w-auto h-13 px-6 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Existing Merchant Sign In</span>
            </Link>
          </div>

          {/* Feature Highlights Grid */}
          <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">WhatsApp Magic Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate 8-character read-only links that customers open on any phone. No app installation required.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Automated Email Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send professional installment payment confirmation emails directly on agreement creation and payment logs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Zero Decimal Drift</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stored in integer Kobo precision with Cloudflare D1 edge database. 100% accurate down to the kobo.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-4 sm:px-8 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">NEFTrack Nigeria</span>
            <span>• Built for Nigerian SMEs</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/login?tab=register" className="hover:text-emerald-400 transition-colors">
              Register Store
            </Link>
            <Link href="/login?tab=login" className="hover:text-emerald-400 transition-colors">
              Sign In
            </Link>
            <Link href="/admin/login" className="text-slate-600 hover:text-slate-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
