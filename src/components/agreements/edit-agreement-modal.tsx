"use client";

import React, { useState } from "react";
import { AgreementWithDetails } from "@/types";
import { updateAgreementAction } from "@/actions/agreements";
import { koboToNaira } from "@/lib/utils";
import {
  X,
  Edit3,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface EditAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreement: AgreementWithDetails;
}

export function EditAgreementModal({
  isOpen,
  onClose,
  agreement,
}: EditAgreementModalProps) {
  const [title, setTitle] = useState(agreement.title);
  const [totalAmountNaira, setTotalAmountNaira] = useState(
    koboToNaira(agreement.total_amount).toString()
  );
  const [dueDate, setDueDate] = useState(
    agreement.due_date ? agreement.due_date.split("T")[0] : ""
  );
  const [notes, setNotes] = useState(agreement.notes || "");
  const [clientName, setClientName] = useState(agreement.client_name);
  const [clientPhone, setClientPhone] = useState(agreement.client_phone);
  const [clientEmail, setClientEmail] = useState(agreement.client_email || "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmountNaira || !clientName || !clientPhone) {
      setError("Please complete all required fields (*).");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await updateAgreementAction({
        agreementId: agreement.id,
        title,
        totalAmountNaira,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        clientName,
        clientPhone,
        clientEmail: clientEmail || undefined,
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Failed to update agreement.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0B111E] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#00D084]">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Installment Agreement
              </h3>
              <p className="text-[11px] text-slate-400">
                Correct plan details, amounts, or customer contact
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Item Details */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Item Details
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item Title *
              </label>
              <div className="relative flex items-center">
                <ShoppingBag className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Price (₦) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-400">₦</span>
                  <input
                    type="number"
                    value={totalAmountNaira}
                    onChange={(e) => setTotalAmountNaira(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customer Information
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Phone *
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="customer@email.com"
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{isLoading ? "Saving..." : "Save Corrections"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
