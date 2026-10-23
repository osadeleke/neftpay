"use client";

import React, { useState, useEffect } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAgreementAction, getClientsListAction } from "@/actions/agreements";
import { Client } from "@/types";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  User,
  Phone,
  ShoppingBag,
  Mail,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface NewAgreementSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAgreementSheet({ isOpen, onClose }: NewAgreementSheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Existing Clients State
  const [clients, setClients] = useState<Client[]>([]);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    title: "",
    totalAmountNaira: "",
    initialDepositNaira: "",
    paymentMethod: "Bank Transfer",
    dueDate: "",
    notes: "",
  });

  // Fetch existing clients whenever the sheet opens
  useEffect(() => {
    if (isOpen) {
      getClientsListAction().then((res) => {
        if (res.success && res.clients && res.clients.length > 0) {
          setClients(res.clients);
          setCustomerMode("existing");
        } else {
          setClients([]);
          setCustomerMode("new");
        }
      });
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const chosen = clients.find((c) => c.id === clientId);
    if (chosen) {
      setFormData((prev) => ({
        ...prev,
        clientName: chosen.full_name,
        clientPhone: chosen.phone_number,
        clientEmail: chosen.email || "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.clientName ||
      !formData.clientPhone ||
      !formData.title ||
      !formData.totalAmountNaira
    ) {
      setError("Please complete all required fields (*).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAgreementAction({
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail || undefined,
        title: formData.title,
        totalAmountNaira: formData.totalAmountNaira,
        initialDepositNaira: formData.initialDepositNaira || "0",
        paymentMethod: formData.paymentMethod,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to create agreement");
      } else {
        // Reset and close
        setFormData({
          clientName: "",
          clientPhone: "",
          clientEmail: "",
          title: "",
          totalAmountNaira: "",
          initialDepositNaira: "",
          paymentMethod: "Bank Transfer",
          dueDate: "",
          notes: "",
        });
        setSelectedClientId("");
        onClose();
        if (res.agreement?.id) {
          router.push(`/agreements/${res.agreement.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="New Part-Payment Plan"
      description="Create agreement and generate WhatsApp Magic Link"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Section 1: Customer Info with Existing Customer Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Customer Information
            </label>

            {clients.length > 0 && (
              <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    customerMode === "existing"
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-[#00D084] shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Existing ({clients.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode("new");
                    setSelectedClientId("");
                    setFormData((prev) => ({
                      ...prev,
                      clientName: "",
                      clientPhone: "",
                      clientEmail: "",
                    }));
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                    customerMode === "new"
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-[#00D084] shadow-xs"
                      : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  }`}
                >
                  <UserPlus className="h-3 w-3" />
                  <span>+ New</span>
                </button>
              </div>
            )}
          </div>

          {/* Mode A: Select Existing Customer */}
          {customerMode === "existing" && clients.length > 0 ? (
            <div className="space-y-2">
              <select
                value={selectedClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                required
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Existing Customer ({clients.length} saved) --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} • {c.phone_number} {c.email ? `(${c.email})` : ""}
                  </option>
                ))}
              </select>

              {selectedClientId && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formData.clientName}
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono">
                      {formData.clientPhone} {formData.clientEmail ? `• ${formData.clientEmail}` : ""}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-[#00D084] bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Returning Customer
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Mode B: Add New Customer */
            <div className="space-y-3">
              <Input
                placeholder="Customer Full Name *"
                value={formData.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                prefixNode={<User className="h-4 w-4" />}
                required
              />
              <Input
                placeholder="WhatsApp Phone Number (e.g. 0803...) *"
                value={formData.clientPhone}
                onChange={(e) => handleChange("clientPhone", e.target.value)}
                prefixNode={<Phone className="h-4 w-4" />}
                type="tel"
                required
              />
              <Input
                placeholder="Customer Email (Optional - auto-sends digital receipt)"
                value={formData.clientEmail}
                onChange={(e) => handleChange("clientEmail", e.target.value)}
                prefixNode={<Mail className="h-4 w-4" />}
                type="email"
              />
            </div>
          )}
        </div>

        {/* Section 2: Agreement Details */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Item & Installment Plan
          </label>
          <Input
            placeholder="Item / Agreement Title (e.g. iPhone 13 Pro) *"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            prefixNode={<ShoppingBag className="h-4 w-4" />}
            required
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Total Price (₦) *
              </label>
              <Input
                placeholder="450000"
                value={formData.totalAmountNaira}
                onChange={(e) => handleChange("totalAmountNaira", e.target.value)}
                prefixNode={<span className="font-bold text-sm text-slate-600">₦</span>}
                type="number"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Initial Deposit (₦)
              </label>
              <Input
                placeholder="150000"
                value={formData.initialDepositNaira}
                onChange={(e) => handleChange("initialDepositNaira", e.target.value)}
                prefixNode={<span className="font-bold text-sm text-slate-600">₦</span>}
                type="number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="POS">POS Terminal</option>
                <option value="Cash">Cash</option>
                <option value="USSD">USSD</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Due Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          <Input
            placeholder="Notes (e.g. 3 installments every 2 weeks)"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        <Button
          type="submit"
          size="full"
          isLoading={isSubmitting}
          className="mt-4"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Create Agreement & Magic Link
        </Button>
      </form>
    </Sheet>
  );
}
