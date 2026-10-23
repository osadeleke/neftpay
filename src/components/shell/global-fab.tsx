"use client";

import React, { useState } from "react";
import { Plus, Receipt, UserPlus, FilePlus2, X } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { NewAgreementSheet } from "@/components/agreements/new-agreement-sheet";
import { QuickPaymentSheet } from "@/components/agreements/quick-payment-sheet";
import { AddClientSheet } from "@/components/agreements/add-client-sheet";

export function GlobalFAB() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<"agreement" | "payment" | "client" | null>(null);

  const handleSelect = (sheetType: "agreement" | "payment" | "client") => {
    setIsMenuOpen(false);
    setActiveSheet(sheetType);
  };

  return (
    <>
      {/* Floating Action Button positioned above bottom nav */}
      <div className="fixed bottom-20 right-4 z-40 sm:right-[max(1rem,calc(50%-13rem))]">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-[#00D084] text-white shadow-xl shadow-emerald-600/35 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Quick Actions"
        >
          <Plus className="h-7 w-7 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
        </button>
      </div>

      {/* Action Selector Sheet */}
      <Sheet
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Quick Action"
        description="Record installments, create agreements, or add new clients"
      >
        <div className="grid grid-cols-1 gap-3 py-2">
          {/* Action 1: Log Payment */}
          <button
            onClick={() => handleSelect("payment")}
            className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all text-left group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                Log Installment Payment
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Record cash, transfer, or POS received and share WhatsApp receipt
              </div>
            </div>
          </button>

          {/* Action 2: New Agreement */}
          <button
            onClick={() => handleSelect("agreement")}
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 text-white shadow-md group-hover:scale-105 transition-transform">
              <FilePlus2 className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                New Part-Payment Agreement
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create plan for phone, solar, electronics, or goods with Magic Link
              </div>
            </div>
          </button>

          {/* Action 3: Add Client */}
          <button
            onClick={() => handleSelect("client")}
            className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-base">
                Add New Client
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Save customer phone and contact details for installment tracking
              </div>
            </div>
          </button>
        </div>
      </Sheet>

      {/* Sub-Sheets for Selected Actions */}
      <NewAgreementSheet
        isOpen={activeSheet === "agreement"}
        onClose={() => setActiveSheet(null)}
      />

      <QuickPaymentSheet
        isOpen={activeSheet === "payment"}
        onClose={() => setActiveSheet(null)}
      />

      <AddClientSheet
        isOpen={activeSheet === "client"}
        onClose={() => setActiveSheet(null)}
      />
    </>
  );
}
