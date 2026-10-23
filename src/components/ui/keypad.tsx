"use client";

import React, { useState } from "react";
import { formatNaira } from "@/lib/utils";
import { Delete, Check } from "lucide-react";

interface NumericKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onConfirm: () => void;
  maxAmountKobo?: number;
  balanceKobo?: number;
}

export function NumericKeypad({
  value,
  onChange,
  onConfirm,
  balanceKobo,
}: NumericKeypadProps) {
  const currentNaira = parseFloat(value || "0");
  const currentKobo = Math.round(currentNaira * 100);

  const handleKeyPress = (num: string) => {
    if (value === "0" && num !== ".") {
      onChange(num);
      return;
    }
    if (num === "." && value.includes(".")) {
      return;
    }
    if (value.length >= 10) return;
    onChange(value + num);
  };

  const handleBackspace = () => {
    if (value.length <= 1) {
      onChange("0");
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange("0");
  };

  const handleQuickAdd = (nairaAdd: number) => {
    const next = (parseFloat(value || "0") + nairaAdd).toString();
    onChange(next);
  };

  const handleFillFullBalance = () => {
    if (balanceKobo && balanceKobo > 0) {
      onChange((balanceKobo / 100).toString());
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Big Display */}
      <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          Installment Amount
        </span>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
          {formatNaira(currentKobo)}
        </div>
        {balanceKobo !== undefined && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Current balance: {formatNaira(balanceKobo)}
          </span>
        )}
      </div>

      {/* Quick Add Chips */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => handleQuickAdd(5000)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
        >
          +₦5k
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(10000)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
        >
          +₦10k
        </button>
        <button
          type="button"
          onClick={() => handleQuickAdd(50000)}
          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 transition-colors"
        >
          +₦50k
        </button>
        {balanceKobo && balanceKobo > 0 && (
          <button
            type="button"
            onClick={handleFillFullBalance}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 font-semibold text-emerald-800 dark:text-emerald-300 transition-colors whitespace-nowrap"
          >
            Full Balance
          </button>
        )}
      </div>

      {/* 3x4 Physical-Style Grid */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleKeyPress(n)}
            className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xl font-bold text-slate-800 dark:text-slate-100 active:scale-95 transition-all shadow-sm"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={handleClear}
          className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-rose-600 dark:text-rose-400 active:scale-95 transition-all"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleKeyPress("0")}
          className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xl font-bold text-slate-800 dark:text-slate-100 active:scale-95 transition-all shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-all shadow-sm"
          aria-label="Backspace"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>

      {/* Done / Continue Button */}
      <button
        type="button"
        onClick={onConfirm}
        disabled={currentKobo <= 0}
        className="h-12 w-full mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
      >
        <Check className="h-5 w-5" />
        Record {formatNaira(currentKobo)}
      </button>
    </div>
  );
}
