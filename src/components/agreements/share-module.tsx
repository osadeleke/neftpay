"use client";

import React, { useState } from "react";
import { AgreementWithDetails } from "@/types";
import { formatNaira, buildWhatsAppLink } from "@/lib/utils";
import { Copy, Check, MessageCircle, ExternalLink, Share2, Sparkles } from "lucide-react";
import Link from "next/link";

interface ShareModuleProps {
  agreement: AgreementWithDetails;
}

export function ShareModule({ agreement }: ShareModuleProps) {
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://neftrack.ng";
  const magicPath = `/c/${agreement.magic_link_slug}`;
  const fullMagicUrl = `${origin}${magicPath}`;

  const isCompleted = agreement.balance_remaining <= 0;

  // Pre-formatted WhatsApp message
  const whatsappMessage = isCompleted
    ? `Hello ${agreement.client_name}! 🎉 Congratulations, your part-payment plan for "${agreement.title}" is now FULLY SETTLED. Here is your final digital receipt: ${fullMagicUrl}`
    : `Hello ${agreement.client_name}, here is your live payment receipt for "${agreement.title}".\n\n💰 Total: ${formatNaira(
        agreement.total_amount
      )}\n✅ Paid to date: ${formatNaira(agreement.total_paid)}\n⏳ Remaining Balance: ${formatNaira(
        agreement.balance_remaining
      )}\n\n👉 Track your digital receipt & installment history here:\n${fullMagicUrl}`;

  const whatsappUrl = buildWhatsAppLink(agreement.client_phone, whatsappMessage);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullMagicUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 p-4 sm:p-5 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Customer Magic Link
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instant zero-cost live receipt for WhatsApp
            </p>
          </div>
        </div>

        <Link
          href={magicPath}
          target="_blank"
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 underline underline-offset-2"
        >
          <span>Preview</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Magic Link Bar */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/90">
        <span className="flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300 px-2 select-all">
          {fullMagicUrl}
        </span>
        <button
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Copy Magic Link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* WhatsApp Remind Button */}
      <div className="mt-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md shadow-[#25D366]/30 transition-all active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5 fill-current" />
          <span>Remind via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
