"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAgreementAction } from "@/actions/agreements";
import { useRouter } from "next/navigation";
import { CheckCircle2, User, Phone, ShoppingBag, Calendar } from "lucide-react";

interface NewAgreementSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAgreementSheet({ isOpen, onClose }: NewAgreementSheetProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.clientName || !formData.clientPhone || !formData.title || !formData.totalAmountNaira) {
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

        {/* Section 1: Customer Info */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Customer Information
          </label>
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
