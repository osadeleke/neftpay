"use client";

import React, { useState } from "react";
import { loginAdminAction } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, ArrowRight, Sparkles, Store } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await loginAdminAction(passcode);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Invalid passcode.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setIsLoading(true);
    const res = await loginAdminAction("neftrack2026admin");
    if (res.success) {
      router.push("/admin");
    } else {
      setError("Passcode check failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-600/30 mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Super-Admin Control
          </h1>
          <p className="text-xs text-slate-400">
            Platform-wide metrics, GMV, and merchant monitoring
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs font-semibold text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Admin Passcode
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="password"
                placeholder="Enter admin secret..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !passcode}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? "Verifying..." : "Access Admin Console"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Dev Access */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleQuickDemoAdmin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant One-Click Admin Sign-in</span>
          </button>
          <div className="text-center text-[10px] text-slate-500 mt-2">
            Default: <code>neftrack2026admin</code>
          </div>
        </div>

        {/* Back to Merchant app */}
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Store className="h-3.5 w-3.5" />
            <span>Return to Merchant Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
