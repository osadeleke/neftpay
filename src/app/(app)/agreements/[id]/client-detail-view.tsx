"use client";

import React, { useState } from "react";
import { AgreementWithDetails, Payment } from "@/types";
import { formatNaira, formatFriendlyDate } from "@/lib/utils";
import { ShareModule } from "@/components/agreements/share-module";
import { PaymentTimeline } from "@/components/agreements/payment-timeline";
import { LogPaymentModal } from "@/components/agreements/log-payment-modal";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  FileText,
} from "lucide-react";

interface ClientDetailViewProps {
  agreement: AgreementWithDetails;
  payments: Payment[];
}

export function ClientDetailView({ agreement, payments }: ClientDetailViewProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const isCompleted = agreement.status === "completed" || agreement.balance_remaining <= 0;
  const isOverdue = agreement.status === "overdue";

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/agreements"
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Ledger</span>
        </Link>

        {isCompleted ? (
          <Badge variant="completed" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Fully Paid
          </Badge>
        ) : isOverdue ? (
          <Badge variant="overdue" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        ) : (
          <Badge variant="active">Active Plan</Badge>
        )}
      </div>

      {/* Item & Customer Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {agreement.title}
        </h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <User className="h-3.5 w-3.5" />
            {agreement.client_name}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {agreement.client_phone}
          </span>
          {agreement.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Due {formatFriendlyDate(agreement.due_date)}
            </span>
          )}
        </div>
      </div>

      {/* 1. Share Module Card (Requirement 3: Screen 3) */}
      <ShareModule agreement={agreement} />

      {/* Financial Overview Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Installment Progress
          </span>
          <span className="text-sm font-black text-slate-900 dark:text-white">
            {agreement.percent_paid}%
          </span>
        </div>

        <div className="mt-2.5">
          <ProgressBar
            value={agreement.percent_paid}
            indicatorColor={isCompleted ? "bg-teal-500" : isOverdue ? "bg-rose-500" : "bg-emerald-500"}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center font-money">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
              {formatNaira(agreement.total_amount)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-[#00D084]">Paid</div>
            <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-[#00D084] mt-0.5">
              {formatNaira(agreement.total_paid)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Balance</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {formatNaira(agreement.balance_remaining)}
            </div>
          </div>
        </div>

        {agreement.notes && (
          <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{agreement.notes}</span>
          </div>
        )}
      </div>

      {/* 2. Vertical Timeline Component: Payment History (Requirement 3: Screen 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Payment History ({payments.length})
          </h3>
          <span className="text-xs text-slate-400">Latest first</span>
        </div>

        <PaymentTimeline payments={payments} />
      </div>

      {/* 3. Sticky Footer Button spanning 100% width: "Log New Payment" (Requirement 3: Screen 3) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md p-4 bg-white/90 dark:bg-[#0B111E]/95 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setIsLogModalOpen(true)}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/35 transition-all"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Log New Payment</span>
        </button>
      </div>

      {/* Numeric Keypad Modal */}
      <LogPaymentModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        agreement={agreement}
      />
    </div>
  );
}
