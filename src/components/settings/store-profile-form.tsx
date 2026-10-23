"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types";
import { updateMerchantProfileAction } from "@/actions/auth";
import { Store, Phone, Mail, MapPin, Edit3, Check, Loader2, Sparkles } from "lucide-react";

interface StoreProfileFormProps {
  session: SessionUser | null;
}

export function StoreProfileForm({ session }: StoreProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState(session?.business_name || "");
  const [phoneNumber, setPhoneNumber] = useState(session?.phone_number || "");
  const [address, setAddress] = useState(session?.address || "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phoneNumber) {
      setError("Business name and phone number are required.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await updateMerchantProfileAction({
        businessName,
        phoneNumber,
        address,
      });

      if (res.success) {
        setSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {businessName || "My Store"}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>{address || "No physical store address set"}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsEditing(!isEditing);
            setError(null);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
        </button>
      </div>

      {success && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-[#00D084] flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Store profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-3.5 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Store / Business Name *
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Store Contact *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Physical Store Address
            </label>
            <input
              type="text"
              placeholder="e.g. Shop 42, Alaba Int'l Market, Lagos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !businessName || !phoneNumber}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00D084] hover:from-emerald-500 hover:to-[#00D084] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            <span>{isLoading ? "Saving Changes..." : "Save Store Profile"}</span>
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              WhatsApp Store Contact:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
              {phoneNumber || "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Store Email:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {session?.email || "merchant@store.ng"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Physical Store Address:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
              {address || "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              Merchant Plan:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px]">
              SME Free Forever (Zero Cost)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
