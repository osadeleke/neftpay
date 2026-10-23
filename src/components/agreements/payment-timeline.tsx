import React from "react";
import { Payment } from "@/types";
import { formatNaira, formatFriendlyDateTime } from "@/lib/utils";
import { CheckCircle2, Clock, Landmark, CreditCard, Banknote, Smartphone } from "lucide-react";

interface PaymentTimelineProps {
  payments: Payment[];
}

export function PaymentTimeline({ payments }: PaymentTimelineProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
        <Clock className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          No Payments Recorded Yet
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Installments logged will appear here in chronological order.
        </p>
      </div>
    );
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "pos":
        return <CreditCard className="h-3.5 w-3.5" />;
      case "cash":
        return <Banknote className="h-3.5 w-3.5" />;
      case "ussd":
        return <Smartphone className="h-3.5 w-3.5" />;
      default:
        return <Landmark className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {payments.map((p, index) => {
        const isLatest = index === 0;
        return (
          <div key={p.id} className="relative group">
            {/* Timeline Node Icon */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 transition-all ${
                isLatest
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-500"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>

            {/* Timeline Card */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {formatNaira(p.amount)}
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {formatFriendlyDateTime(p.created_at)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {getMethodIcon(p.payment_method)}
                  <span>{p.payment_method}</span>
                </div>
              </div>

              {p.reference_note && (
                <div className="mt-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                  {p.reference_note}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="font-mono">Ref #{p.id.slice(0, 10)}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {p.receipt_sent ? "WhatsApp receipt ready" : "Logged"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
