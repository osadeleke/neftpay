"use client";

import React, { useState, useEffect, Suspense } from "react";
import { AgreementWithDetails } from "@/types";
import { getAgreementsListAction } from "@/actions/agreements";
import { AgreementCard } from "@/components/agreements/agreement-card";
import { Search, SlidersHorizontal, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

function AgreementsListContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [agreements, setAgreements] = useState<AgreementWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>(initialStatus);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgreements = async () => {
    setIsLoading(true);
    try {
      const res = await getAgreementsListAction({
        search: searchQuery,
        status: activeTab,
      });
      if (res.success && res.agreements) {
        setAgreements(res.agreements);
      }
    } catch (err) {
      console.error("Failed to load agreements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [searchQuery, activeTab]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Installment Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All part-payment contracts & magic links
          </p>
        </div>
        <button
          onClick={fetchAgreements}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title="Refresh Ledger"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Sticky Search Bar (Requirement 3: Screen 2) */}
      <div className="sticky top-[58px] z-20 -mx-4 px-4 py-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by client, item, phone, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "overdue", label: "Overdue" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapped List of Card components */}
      <div className="space-y-3 pt-1">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : agreements.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900/40">
            <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Agreements Found
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? `No results matching "${searchQuery}".`
                : "Tap the '+' floating button at bottom right to record your first customer plan!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agreements.map((agreement) => (
              <AgreementCard
                key={agreement.id}
                agreement={agreement}
                showQuickRemind={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgreementsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 pt-4">
          <div className="h-10 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
      }
    >
      <AgreementsListContent />
    </Suspense>
  );
}
