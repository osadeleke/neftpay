"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { NumericKeypad } from "@/components/ui/keypad";
import { logPaymentAction } from "@/actions/agreements";
import { AgreementWithDetails } from "@/types";
import { formatNaira, buildWhatsAppLink } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: AgreementWithDetails;
}

export function LogPaymentModal({ isOpen, onClose, agreement }: LogPaymentModalProps) {
  const router = useRouter();
  const [amountNaira, setAmountNaira] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNote, setReferenceNote] = useState("");
  const [step, setStep] = useState<"keypad" | "details" | "success">("keypad");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPaymentAmount, setLastPaymentAmount] = useState(0);

  const handleKeypadConfirm = () => {
    if (parseFloat(amountNaira) <= 0) return;
    setStep("details");
  };

  const handleFinalSubmit = async () => {
    const nairaNum = parseFloat(amountNaira);
    if (nairaNum <= 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await logPaymentAction({
        agreementId: agreement.id,
        amountNaira,
        paymentMethod,
        referenceNote: referenceNote || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to log payment");
        setIsSubmitting(false);
      } else {
        setLastPaymentAmount(nairaNum);
        setStep("success");
        setIsSubmitting(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmountNaira("0");
    setReferenceNote("");
    setStep("keypad");
    setError(null);
    onClose();
  };

  // WhatsApp receipt for this specific installment
  const origin = typeof window !== "undefined" ? window.location.origin : "https://neftrack.ng";
  const magicUrl = `${origin}/c/${agreement.magic_link_slug}`;
  const receiptMessage = `Hello ${agreement.client_name}! We have received your installment payment of ₦${lastPaymentAmount.toLocaleString()} for "${agreement.title}".\n\nTrack your updated receipt and balance here:\n${magicUrl}`;
  const whatsappUrl = buildWhatsAppLink(agreement.client_phone, receiptMessage);

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "success" ? "Payment Recorded!" : "Log New Payment"}
      description={`Customer: ${agreement.client_name}`}
    >
      <div className="pb-2">
        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Step 1: Physical-Style Numeric Keypad */}
        {step === "keypad" && (
          <NumericKeypad
            value={amountNaira}
            onChange={setAmountNaira}
            onConfirm={handleKeypadConfirm}
            balanceKobo={agreement.balance_remaining}
          />
        )}

        {/* Step 2: Payment Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Amount Received
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatNaira(parseFloat(amountNaira) * 100)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Remaining after this:{" "}
                <strong>
                  {formatNaira(Math.max(0, agreement.balance_remaining - parseFloat(amountNaira) * 100))}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Bank Transfer", "POS", "Cash", "USSD"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentMethod === m
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Reference / Bank Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. OPay / Moniepoint Ref..."
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep("keypad")}
                className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Change Amount
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Logging..." : "Confirm & Save"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success & Instant WhatsApp Share */}
        {step === "success" && (
          <div className="py-4 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                ₦{lastPaymentAmount.toLocaleString()} Logged!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Installment successfully added to agreement ledger.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md shadow-[#25D366]/30"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>Send WhatsApp Receipt Now</span>
            </a>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}
