"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import {
  registerMerchantAction,
  loginWithEmailAction,
  loginAsDemoMerchantAction,
} from "@/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  Mail,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
  User,
  Zap,
  Building2,
  Check,
} from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"register" | "login">("register");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "login" || tabParam === "register") {
      setTab(tabParam);
    }
  }, [searchParams]);

  // Registration state
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [regEmail, setRegEmail] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phoneNumber || !regEmail) {
      setError("Please fill in all store details.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await registerMerchantAction({
        businessName,
        phoneNumber,
        email: regEmail,
      });

      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Failed to register store.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await loginWithEmailAction(loginEmail);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "No store found with this email.");
        if (res.notFound) {
          setTab("register");
          setRegEmail(loginEmail);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    await loginAsDemoMerchantAction();
  };

  return (
    <div className="min-h-screen bg-slate-900/10 dark:bg-[#070B12] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0B111E] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Radiant Jade Ambient Glow */}
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-tr from-emerald-500/15 via-[#00D084]/20 to-teal-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#00D084] text-white shadow-lg shadow-emerald-600/30 mx-auto">
            <Store className="h-7 w-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-[#00D084] text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            <span>Zero Marginal Cost SaaS for Nigerian SMEs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            NEFTrack
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Log part-payments and instantly share read-only digital receipts with customers via WhatsApp.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="mt-6 grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`py-2.5 rounded-xl transition-all ${
              tab === "register"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#00D084] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Register Store
          </button>
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2.5 rounded-xl transition-all ${
              tab === "login"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-[#00D084] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* TAB 1: Register Store (Production Onboarding) */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store / Business Name *
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Segun Phones & Electronics"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Store Number *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="0803 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Customers will be directed to this WhatsApp number
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Owner Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="merchant@store.ng"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !businessName || !phoneNumber || !regEmail}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isLoading ? "Provisioning Store..." : "Create My Store Ledger"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* TAB 2: Sign In Existing Store */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Store Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="merchant@store.ng"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-10 pr-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !loginEmail}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? "Signing in..." : "Open Store Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Google OAuth Option */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-[#0B111E] px-3 text-[10px] font-semibold uppercase text-slate-400">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
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
              <span>Continue with Google</span>
            </button>
          </form>
        )}

        {/* Secondary Sandbox Tester Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading}
            className="text-[11px] font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-[#00D084] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isDemoLoading ? "Loading Sandbox..." : "Explore with pre-loaded demo store (Adebayo Electronics)"}</span>
          </button>
        </div>

        {/* Security Tag */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Lock className="h-3 w-3 text-emerald-500" />
          <span>Stateless HTTP-only Session • Cloudflare D1 Engine</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900/10 dark:bg-[#070B12] flex items-center justify-center text-xs text-slate-500">
          Loading NEFTrack portal...
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}

