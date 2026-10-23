import React from "react";
import { getSession } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import { StoreProfileForm } from "@/components/settings/store-profile-form";
import {
  MessageCircle,
  HelpCircle,
  Mail,
  LogOut,
  ChevronRight,
  Share2,
  ShieldCheck,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await getSession();

  // Support endpoints configured as requested (without exposing raw contact info in UI text)
  const whatsappSupportUrl =
    "https://wa.me/2348052215683?text=Hello%20NEFTrack%20Support,%20I%20need%20help%20with%20my%20store%20ledger";
  const emailSupportUrl =
    "mailto:hello@the984group@gmail.com,the984group@gmail.com?subject=NEFTrack%20Merchant%20Support";

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

      {/* Interactive Store Profile Card (Editable) */}
      <StoreProfileForm session={session} />

      {/* WhatsApp Receipt Defaults */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            WhatsApp Receipt Defaults
          </h4>
        </div>

        <div className="mt-3.5 space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-emerald-600" />
              Customer Receipt Template:
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-mono">
              &quot;Hello &#123;customer&#125;, here is your live payment receipt for &#123;item&#125; at {session?.business_name || "your store"}. Remaining balance: ₦&#123;balance&#125;. Track your installments: &#123;magic_link&#125;&quot;
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 dark:text-slate-400">Currency Precision:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Nigerian Naira (₦) • Integer Kobo Precision
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Delivery Channels:</span>
            <span className="font-bold text-[#128C7E] dark:text-[#00D084]">
              Direct WhatsApp & Cloudflare Email
            </span>
          </div>
        </div>
      </div>

      {/* Support & Merchant Help (Points directly to specified support channels) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
        <a
          href={whatsappSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00D084]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Contact Support via WhatsApp
              </div>
              <div className="text-[11px] text-slate-400">
                Direct WhatsApp merchant assistance & ledger inquiries
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </a>

        <div className="border-t border-slate-100 dark:border-slate-800/80" />

        <a
          href={emailSupportUrl}
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Email Merchant Support
              </div>
              <div className="text-[11px] text-slate-400">
                Send formal support request or report an issue
              </div>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </a>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full h-12 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of Store</span>
          </button>
        </form>
      </div>
    </div>
  );
}
