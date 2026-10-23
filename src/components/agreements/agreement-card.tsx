"use client";

import React from "react";
import Link from "next/link";
import { AgreementWithDetails } from "@/types";
import { formatNaira, buildWhatsAppLink } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { ChevronRight, MessageCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

interface AgreementCardProps {
  agreement: AgreementWithDetails;
  showQuickRemind?: boolean;
}

export function AgreementCard({ agreement, showQuickRemind = true }: AgreementCardProps) {
  const isCompleted = agreement.status === "completed" || agreement.balance_remaining <= 0;
  const isOverdue = agreement.status === "overdue";

  // Pre-formatted WhatsApp reminder text
  const origin = typeof window !== "undefined" ? window.location.origin : "https://neftrack.ng";
  const magicUrl = `${origin}/c/${agreement.magic_link_slug}`;
  const reminderText = `Hello ${agreement.client_name}, this is a gentle reminder regarding your installment balance of ${formatNaira(
    agreement.balance_remaining
  )} for "${agreement.title}". You can track your updated payment receipt here: ${magicUrl}`;

  const whatsappUrl = buildWhatsAppLink(agreement.client_phone, reminderText);

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      <Link href={`/agreements/${agreement.id}`} className="block p-4 sm:p-5">
        {/* Top Header: Client & Status Pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
              {agreement.client_name}
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {agreement.title}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isCompleted ? (
              <Badge variant="completed" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            ) : isOverdue ? (
              <Badge variant="overdue" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </Badge>
            ) : (
              <Badge variant="active">Active</Badge>
            )}
          </div>
        </div>

        {/* Amount & Progress */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatNaira(agreement.total_paid)}
              <span className="text-slate-400 font-normal"> / {formatNaira(agreement.total_amount)}</span>
            </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {agreement.percent_paid}%
            </span>
          </div>

          <ProgressBar
            value={agreement.percent_paid}
            indicatorColor={
              isCompleted
                ? "bg-teal-500"
                : isOverdue
                ? "bg-rose-500"
                : "bg-emerald-500"
            }
          />
        </div>

        {/* Footer info: Balance remaining & chevron */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            {isCompleted ? (
              <span className="text-teal-600 dark:text-teal-400 font-semibold">
                Fully Settled
              </span>
            ) : (
              <>
                Balance:{" "}
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatNaira(agreement.balance_remaining)}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showQuickRemind && !isCompleted && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-semibold transition-colors"
                title="Send WhatsApp Reminder"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Remind</span>
              </a>
            )}
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
