import React from "react";
import { getSession } from "@/lib/auth/session";
import { logoutAction, loginAsDemoMerchantAction } from "@/actions/auth";
import Link from "next/link";
import {
  Store,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  Sparkles,
  MessageCircle,
  HelpCircle,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Smartphone,
  Share2,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Store Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your merchant business profile and WhatsApp receipts
        </p>
      </div>

      {/* Merchant Profile Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {session?.business_name || "Adebayo Electronics & Solar"}
              </h3>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 text-emerald-600" />
              <span>Computer Village, Ikeja, Lagos</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              WhatsApp Store Contact:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {session?.phone_number || "08035552341"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Store Email:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {session?.email || "adebayo@electronics.ng"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Merchant Plan:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px]">
              SME Free Forever (Zero Cost)
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Receipt & Messaging Module */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            WhatsApp Receipt Defaults
          </h4>
        </div>

        <div className="mt-3.5 space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-emerald-600" />
              Default Customer Receipt Template:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-mono">
              &quot;Hello &#123;customer&#125;, here is your live payment receipt for &#123;item&#125; at {session?.business_name || "Adebayo Electronics"}. Remaining balance: ₦&#123;balance&#125;. Track your installments: &#123;magic_link&#125;&quot;
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 dark:text-slate-400">Currency Precision:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Nigerian Naira (₦) • Kobo Accuracy
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Delivery Channel:</span>
            <span className="font-bold text-[#128C7E] dark:text-[#25D366]">
              Direct WhatsApp (No SMS Fees)
            </span>
          </div>
        </div>
      </div>

      {/* Support & Merchant Help */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <a
          href="https://wa.me/2348000000000?text=Hello%20NEFTrack%20Support,%20I%20need%20help%20with%20my%20installment%20ledger"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                Contact NEFTrack Merchant Support
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Quick WhatsApp help & feature requests
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </a>
      </div>

      {/* Super-Admin Platform Portal (Discreet Founder Access) */}
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Platform Founder / Owner
              </div>
              <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                View platform-wide GMV, money received & all merchants
              </div>
            </div>
          </div>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Admin Portal
          </Link>
        </div>
      </div>

      {/* Account Actions */}
      <div className="space-y-2 pt-1">
        <form action={loginAsDemoMerchantAction}>
          <button
            type="submit"
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <span>Reset Demo Store (Adebayo Electronics)</span>
          </button>
        </form>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
