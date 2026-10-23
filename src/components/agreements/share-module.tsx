"use client";

import React, { useState } from "react";
import { AgreementWithDetails } from "@/types";
import { formatNaira, buildWhatsAppLink } from "@/lib/utils";
import { Copy, Check, MessageCircle, ExternalLink, Sparkles, Mail, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { sendManualReceiptEmailAction } from "@/actions/email";

interface ShareModuleProps {
  agreement: AgreementWithDetails;
}

export function ShareModule({ agreement }: ShareModuleProps) {
  const [copied, setCopied] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState(agreement.client_email || "");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://neftrack.ng";
  const magicPath = `/c/${agreement.magic_link_slug}`;
  const fullMagicUrl = `${origin}${magicPath}`;

  const isCompleted = agreement.balance_remaining <= 0;

  // Pre-formatted WhatsApp message
  const whatsappMessage = isCompleted
    ? `Hello ${agreement.client_name}! 🎉 Congratulations, your part-payment plan for "${agreement.title}" is now FULLY SETTLED. Here is your official digital receipt: ${fullMagicUrl}`
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setEmailStatus("Please enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await sendManualReceiptEmailAction({
        agreementId: agreement.id,
        recipientEmail: emailInput,
      });

      if (res.success) {
        setEmailStatus(
          res.mocked
            ? "Receipt dispatched! (Mock mode: logged to dev console)"
            : "Receipt email sent successfully to customer!"
        );
        setTimeout(() => {
          setShowEmailInput(false);
          setEmailStatus(null);
        }, 4000);
      } else {
        setEmailStatus(res.error || "Failed to deliver email.");
      }
    } catch (err: any) {
      setEmailStatus(err.message || "Error sending email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-white to-teal-500/5 p-5 shadow-sm dark:border-emerald-500/20 dark:from-[#0B1528] dark:via-[#0F172A] dark:to-[#071324]">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#00D084] text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-[#00D084]">
              Customer Magic Link
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Instant zero-cost live receipt for WhatsApp & Email
            </p>
          </div>
        </div>

        <Link
          href={magicPath}
          target="_blank"
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-[#00D084] underline underline-offset-2"
        >
          <span>Preview</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Magic Link Bar */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-2 dark:border-slate-800 dark:bg-slate-900/90 shadow-inner">
        <span className="flex-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300 px-2 select-all">
          {fullMagicUrl}
        </span>
        <button
          onClick={handleCopy}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Copy Magic Link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-[#00D084]" />
              <span className="text-emerald-600 dark:text-[#00D084]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons: WhatsApp & Email */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs whatsapp-glow transition-all active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4 fill-current" />
          <span>Remind via WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={() => setShowEmailInput(!showEmailInput)}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-[0.98]"
        >
          <Mail className="h-4 w-4 text-emerald-600 dark:text-[#00D084]" />
          <span>Send via Email</span>
        </button>
      </div>

      {/* Interactive Email Dispatch Box */}
      {showEmailInput && (
        <form onSubmit={handleSendEmail} className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Customer Email Address
            </label>
            <span className="text-[10px] text-slate-400">Instant digital receipt</span>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="customer@email.com"
              required
              className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={isSendingEmail || !emailInput}
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSendingEmail ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>{isSendingEmail ? "Sending..." : "Send"}</span>
            </button>
          </div>
          {emailStatus && (
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-[#00D084] pt-1">
              {emailStatus}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
