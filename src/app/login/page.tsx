"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { loginAsDemoMerchantAction, loginWithEmailAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import {
  Store,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await loginWithEmailAction(email, businessName);
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await loginAsDemoMerchantAction();
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Decorative Glow */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/30 mx-auto">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            NEFTrack
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Zero-marginal-cost installment ledger & WhatsApp Magic Links for Nigerian SMEs
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Demo Merchant Quick Start (Recommended for pairing & instant testing) */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Instant Sandbox Access
            </span>
            <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 mt-1">
            Pre-loaded with <strong>Adebayo Electronics</strong>, Computer Village, Ikeja (active installments, overdue plans & receipts).
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="mt-3 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isDemoLoading ? (
              "Loading Sandbox..."
            ) : (
              <>
                <span>Enter as Adebayo Electronics</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Or sign in to your store
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-3 transition-colors shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google OAuth</span>
        </button>

        {/* Magic Email Link Form */}
        <form onSubmit={handleEmailLogin} className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Store / Business Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alaba Gadgets Hub"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="merchant@business.ng"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            <span>{isLoading ? "Signing in..." : "Sign in via Magic Link"}</span>
          </button>
        </form>

        {/* Security Assurance */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Lock className="h-3.5 w-3.5 text-emerald-500" />
          <span>Stateless HTTP-only JWT sessions • Cloudflare D1</span>
        </div>
      </div>
    </div>
  );
}
