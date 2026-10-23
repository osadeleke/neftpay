"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import {
  registerMerchantAction,
  loginWithPasswordAction,
  sendLoginOtpAction,
  verifyLoginOtpAction,
} from "@/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  Phone,
  Building2,
  MapPin,
  KeyRound,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"register" | "login">("register");

  // Sign in mode: "password" or "otp"
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");

  // Registration state
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "login" || tabParam === "register") {
      setTab(tabParam);
    }
  }, [searchParams]);

  // Handle Store Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phoneNumber || !regEmail || !regPassword) {
      setError("Please fill in all required fields marked with *.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await registerMerchantAction({
        businessName,
        phoneNumber,
        address: storeAddress || undefined,
        email: regEmail,
        password: regPassword,
      });

      if (res.success) {
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Failed to register store.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login with Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await loginWithPasswordAction({
        email: loginEmail,
        password: loginPassword,
      });

      if (res.success) {
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Failed to sign in.");
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

  // Handle Requesting OTP Code
  const handleRequestOtp = async () => {
    if (!loginEmail || !loginEmail.includes("@")) {
      setError("Please enter your registered store email first.");
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await sendLoginOtpAction(loginEmail);
      if (res.success) {
        setOtpSent(true);
        setInfoMessage(res.message || "A 6-digit login code has been sent to your email.");
      } else {
        setError(res.error || "Could not send verification code.");
      }
    } catch (err: any) {
      setError(err.message || "Error requesting verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verifying OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyLoginOtpAction({
        email: loginEmail,
        code: otpCode,
      });

      if (res.success) {
        window.location.href = "/dashboard";
      } else {
        setError(res.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#0B111E] rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Radiant Jade Ambient Glow */}
        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-tr from-emerald-500/15 via-[#00D084]/20 to-teal-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#00D084] text-white shadow-lg shadow-emerald-600/30 mx-auto">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">NEFTrack</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Log part-payments and instantly share read-only digital receipts with customers via WhatsApp.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-900 text-xs font-semibold text-rose-300">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-[#00D084]">
            {infoMessage}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="mt-6 grid grid-cols-2 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              tab === "register"
                ? "bg-slate-900 text-[#00D084] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Register Store
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError(null);
              setInfoMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              tab === "login"
                ? "bg-slate-900 text-[#00D084] shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* TAB 1: Register Store (Provision Store & Set Password) */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Store / Business Name *
              </label>
              <div className="relative flex items-center">
                <Building2 className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Segun Gadgets & Electronics"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                WhatsApp Phone Number *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="0803 123 4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Store Physical Address (Optional)
              </label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Shop 14, Alaba Market, Lagos"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
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
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Store Password (Min 6 characters) *
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !businessName || !phoneNumber || !regEmail || !regPassword}
              className="w-full h-12 mt-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isLoading ? "Creating Store..." : "Create My Store Ledger"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* TAB 2: Sign In (Password OR 6-Digit Email Code) */}
        {tab === "login" && (
          <div className="mt-5 space-y-4">
            {/* Sub-toggle: Password vs 6-digit Code */}
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-slate-400 font-semibold">Sign in using:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("password");
                    setError(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    loginMode === "password"
                      ? "bg-emerald-500/20 text-[#00D084] border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("otp");
                    setError(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    loginMode === "otp"
                      ? "bg-emerald-500/20 text-[#00D084] border border-emerald-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  6-Digit Email Code
                </button>
              </div>
            </div>

            {/* Mode A: Password Login */}
            {loginMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Store Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="merchant@store.ng"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setLoginMode("otp")}
                      className="text-[10px] text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !loginEmail || !loginPassword}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-emerald-600/25"
                >
                  <span>{isLoading ? "Verifying..." : "Sign In to Store"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Mode B: 6-Digit Email OTP Verification */}
            {loginMode === "otp" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Store Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="merchant@store.ng"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-3.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isSendingOtp || !loginEmail}
                    className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>{isSendingOtp ? "Sending Code..." : "Send 6-Digit Code to Email"}</span>
                  </button>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Enter 6-Digit Code
                      </label>
                      <div className="relative flex items-center">
                        <KeyRound className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="849201"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          required
                          className="h-12 w-full text-center tracking-[8px] font-mono font-bold text-base rounded-xl border border-emerald-500/50 bg-slate-900 text-[#00D084] focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span>{isLoading ? "Verifying..." : "Verify & Sign In"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSendingOtp}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        Didn&apos;t get code? Resend
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Google OAuth Option */}
            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-[#0B111E] px-3 text-[10px] font-semibold uppercase text-slate-500">
                Or
              </span>
            </div>

            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-11 rounded-xl border border-slate-800 hover:bg-slate-800/80 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
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
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Stateless HTTP-only Session • Password & 6-Digit OTP Protected</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B12] flex items-center justify-center text-xs text-slate-500">
          Loading NEFTrack portal...
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
