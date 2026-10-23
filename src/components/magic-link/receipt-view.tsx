"use client";

import React, { useState } from "react";
import { MagicLinkData } from "@/types";
import { formatNaira, formatFriendlyDateTime, buildWhatsAppLink } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  MessageCircle,
  Landmark,
  Store,
  ChevronDown,
  Sparkles,
  Phone,
  Copy,
  Check,
} from "lucide-react";

interface ReceiptViewProps {
  data: MagicLinkData;
}

export function ReceiptView({ data }: ReceiptViewProps) {
  const [copied, setCopied] = useState(false);
  const { agreement, client, merchant, payments, totalPaidKobo, balanceRemainingKobo, percentPaid, isCompleted } = data;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Payment Receipt: ${agreement.title}`,
            text: `Receipt for ${agreement.title} at ${merchant.business_name}. Remaining balance: ${formatNaira(
              balanceRemainingKobo
            )}`,
            url: window.location.href,
          });
          return;
        } catch {
          // fallback
        }
      }
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // WhatsApp merchant chat link
  const merchantWhatsAppMessage = `Hello ${merchant.business_name}, I am viewing my NEFTrack digital receipt for "${agreement.title}" (Ref: ${agreement.magic_link_slug}).`;
  const merchantChatUrl = buildWhatsAppLink(merchant.phone_number, merchantWhatsAppMessage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-6 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-4">
        {/* Top Public Header: Merchant Business Name */}
        <header className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {merchant.business_name}
                </h1>
                <span title="Verified SME">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                </span>
              </div>
              {merchant.address ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {merchant.address}
                </p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official Digital Installment Receipt
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors print:hidden"
            title="Print Receipt"
          >
            <Printer className="h-4 w-4" />
          </button>
        </header>

        {/* Card: Agreement Title and Total Amount */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Customer Item
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {agreement.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Issued to: <strong>{client.full_name}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-400 uppercase">
                Total Cost
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {formatNaira(agreement.total_amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Hero Card: Remaining Balance (Huge Font) */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-2xl ${
            isCompleted
              ? "bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/40 shadow-teal-900/30"
              : "hero-gradient border border-emerald-500/35 hero-glow-emerald"
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#00D084]/15 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {isCompleted ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold mb-2 border border-teal-400/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>PAYMENT COMPLETE & SETTLED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 dark:text-[#00D084] text-xs font-bold mb-2 border border-emerald-500/30">
                <Clock className="h-3.5 w-3.5" />
                <span>REMAINING BALANCE</span>
              </div>
            )}

            {/* Hero Text: Remaining Balance (Huge Font) */}
            <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1 text-white font-money">
              {formatNaira(balanceRemainingKobo)}
            </div>

            <p className="text-xs text-slate-300 mt-2 font-medium">
              {isCompleted
                ? "All scheduled installments have been paid in full."
                : `₦${(totalPaidKobo / 100).toLocaleString()} already paid (${percentPaid}%)`}
            </p>

            {/* Progress Bar inside hero */}
            <div className="w-full mt-5 bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                  isCompleted
                    ? "bg-gradient-to-r from-teal-400 to-cyan-400"
                    : "bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00D084]"
                }`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>
        </div>

        {/* List: Timestamped history of payments made */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <span>Installment Payment History</span>
            </h3>
            <span className="text-xs font-medium text-slate-400">
              {payments.length} {payments.length === 1 ? "payment" : "payments"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {payments.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No installments recorded yet.
              </p>
            ) : (
              payments.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs font-bold shrink-0 mt-0.5">
                      #{payments.length - idx}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatNaira(p.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatFriendlyDateTime(p.created_at)}
                      </div>
                      {p.reference_note && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          {p.reference_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {p.payment_method}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons: Message Merchant & Share Receipt */}
        <div className="grid grid-cols-2 gap-2.5 print:hidden">
          <a
            href={merchantChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-sm transition-all"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            <span>Chat Merchant</span>
          </a>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span>Share Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Powered by NEFTrack Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 print:mt-4">
        <p className="flex items-center justify-center gap-1 font-medium">
          <span>Secured by</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">NEFTrack</span>
          <span>• Zero-Cost SME Ledger</span>
        </p>
      </footer>
    </div>
  );
}
