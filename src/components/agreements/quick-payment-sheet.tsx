"use client";

import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { NumericKeypad } from "@/components/ui/keypad";
import { logPaymentAction, getAgreementsListAction } from "@/actions/agreements";
import { AgreementWithDetails } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";

interface QuickPaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPaymentSheet({ isOpen, onClose }: QuickPaymentSheetProps) {
  const router = useRouter();
  const [agreements, setAgreements] = useState<AgreementWithDetails[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>("");
  const [amountNaira, setAmountNaira] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNote, setReferenceNote] = useState("");
  const [step, setStep] = useState<"select" | "amount" | "confirm">("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getAgreementsListAction({ status: "active" }).then((res) => {
        if (res.success && res.agreements) {
          setAgreements(res.agreements);
          if (res.agreements.length > 0) {
            setSelectedAgreementId(res.agreements[0].id);
          }
        }
      });
      setStep("select");
      setAmountNaira("0");
    }
  }, [isOpen]);

  const selectedAgreement = agreements.find((a) => a.id === selectedAgreementId);

  const handleConfirmAmount = () => {
    if (parseFloat(amountNaira) <= 0) return;
    setStep("confirm");
  };

  const handleFinalSubmit = async () => {
    if (!selectedAgreementId || parseFloat(amountNaira) <= 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await logPaymentAction({
        agreementId: selectedAgreementId,
        amountNaira,
        paymentMethod,
        referenceNote: referenceNote || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to log payment.");
      } else {
        onClose();
        router.push(`/agreements/${selectedAgreementId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Log Installment Payment"
      description="Record customer payment and update remaining balance"
    >
      <div className="space-y-4 pb-2">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Step 1: Select Active Agreement */}
        {step === "select" && (
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Client / Agreement
            </label>
            {agreements.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No active agreements found. Create one first!
              </p>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {agreements.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAgreementId(a.id);
                      setStep("amount");
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedAgreementId === a.id
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {a.client_name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {a.title}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Rem: {formatNaira(a.balance_remaining)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {a.percent_paid}% paid
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Amount via Numeric Keypad */}
        {step === "amount" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Client: <strong>{selectedAgreement?.client_name}</strong></span>
              <button
                type="button"
                onClick={() => setStep("select")}
                className="text-emerald-600 font-semibold underline"
              >
                Change
              </button>
            </div>
            <NumericKeypad
              value={amountNaira}
              onChange={setAmountNaira}
              onConfirm={handleConfirmAmount}
              balanceKobo={selectedAgreement?.balance_remaining}
            />
          </div>
        )}

        {/* Step 3: Final confirmation (Method & note) */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
                Payment To Record
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {formatNaira(parseFloat(amountNaira) * 100)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                For <strong>{selectedAgreement?.client_name}</strong> ({selectedAgreement?.title})
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Payment Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["Bank Transfer", "POS", "Cash", "USSD"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === m
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                Reference / Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. GTBank Transfer ref 8829..."
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("amount")}
                className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-600 dark:text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Confirm & Record
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
