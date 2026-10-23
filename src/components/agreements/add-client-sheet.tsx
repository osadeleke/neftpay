"use client";

import React, { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddClientSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddClientSheet({ isOpen, onClose }: AddClientSheetProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    // Client can be auto-registered with agreement or standalone
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setName("");
        setPhone("");
        setEmail("");
        onClose();
        router.refresh();
      }, 1000);
    }, 400);
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Client"
      description="Save customer WhatsApp number for installment receipts"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-2">
        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Client saved successfully!
          </div>
        )}

        <div className="space-y-3">
          <Input
            placeholder="Client Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            prefixNode={<User className="h-4 w-4" />}
            required
          />
          <Input
            placeholder="WhatsApp Phone Number (e.g. 08031234567) *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            prefixNode={<Phone className="h-4 w-4" />}
            type="tel"
            required
          />
          <Input
            placeholder="Email Address (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixNode={<Mail className="h-4 w-4" />}
            type="email"
          />
        </div>

        <Button
          type="submit"
          size="full"
          isLoading={isSubmitting}
          className="mt-4"
        >
          Save Client
        </Button>
      </form>
    </Sheet>
  );
}
