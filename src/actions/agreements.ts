"use server";

import { revalidatePath } from "next/cache";
import { requireMerchantId, getSession } from "@/lib/auth/session";
import {
  createAgreement as dbCreateAgreement,
  getAgreementById as dbGetAgreementById,
  getAgreementsList as dbGetAgreementsList,
  getClientsList as dbGetClientsList,
  getDashboardStats as dbGetDashboardStats,
  getMagicLinkData as dbGetMagicLinkData,
  logPayment as dbLogPayment,
  updateAgreement as dbUpdateAgreement,
  deletePayment as dbDeletePayment,
} from "@/lib/db/queries";
import { nairaToKobo } from "@/lib/utils";
import {
  triggerAgreementCreatedEmail,
  triggerPaymentReceiptEmail,
} from "@/lib/email/service";

/**
 * 1. createAgreement
 * Creates Client (if new), generates random 8-char slug, creates Agreement,
 * and records optional initial deposit in Kobo.
 */
export async function createAgreementAction(formData: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  title: string;
  totalAmountNaira: number | string;
  initialDepositNaira?: number | string;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}) {
  try {
    // Multi-tenant isolation: strictly extracted from authenticated session token
    const merchantId = await requireMerchantId();

    const totalAmountKobo = nairaToKobo(formData.totalAmountNaira);
    const initialDepositKobo = formData.initialDepositNaira
      ? nairaToKobo(formData.initialDepositNaira)
      : 0;

    if (!formData.title || !formData.clientName || !formData.clientPhone) {
      return { success: false, error: "Title, client name, and phone number are required." };
    }

    if (totalAmountKobo <= 0) {
      return { success: false, error: "Total amount must be greater than ₦0." };
    }

    const agreement = await dbCreateAgreement({
      merchantId,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      title: formData.title,
      totalAmountKobo,
      initialDepositKobo,
      paymentMethod: formData.paymentMethod || "Bank Transfer",
      dueDate: formData.dueDate,
      notes: formData.notes,
    });

    revalidatePath("/dashboard");
    revalidatePath("/agreements");

    // Trigger customer confirmation email if customer email is provided
    if (formData.clientEmail) {
      getSession().then((session) => {
        const businessName = session?.business_name || session?.name || "Merchant Store";
        triggerAgreementCreatedEmail({
          clientEmail: formData.clientEmail!,
          clientName: formData.clientName,
          businessName,
          itemTitle: formData.title,
          totalAmountKobo,
          depositKobo: initialDepositKobo,
          balanceKobo: agreement.balance_remaining,
          dueDate: formData.dueDate,
          magicLinkSlug: agreement.magic_link_slug,
        }).catch((err) => console.error("Agreement created email warning:", err));
      });
    }

    return { success: true, agreement };
  } catch (err: any) {
    console.error("createAgreementAction error:", err);
    return { success: false, error: err.message || "Failed to create agreement." };
  }
}

/**
 * 2. logPayment
 * Inserts into Payments table and auto-updates Agreement status if fully settled.
 */
export async function logPaymentAction(params: {
  agreementId: string;
  amountNaira: number | string;
  paymentMethod: string;
  referenceNote?: string;
}) {
  try {
    const merchantId = await requireMerchantId();
    const amountKobo = nairaToKobo(params.amountNaira);

    if (amountKobo <= 0) {
      return { success: false, error: "Payment amount must be greater than ₦0." };
    }

    const result = await dbLogPayment({
      merchantId,
      agreementId: params.agreementId,
      amountKobo,
      paymentMethod: params.paymentMethod,
      referenceNote: params.referenceNote,
    });

    revalidatePath("/dashboard");
    revalidatePath("/agreements");
    revalidatePath(`/agreements/${params.agreementId}`);
    if (result.agreement?.magic_link_slug) {
      revalidatePath(`/c/${result.agreement.magic_link_slug}`);
    }

    // Trigger payment receipt email if customer has an email attached
    if (result.agreement?.client_email) {
      getSession().then((session) => {
        const businessName = session?.business_name || session?.name || "Merchant Store";
        triggerPaymentReceiptEmail({
          clientEmail: result.agreement.client_email!,
          clientName: result.agreement.client_name,
          businessName,
          itemTitle: result.agreement.title,
          amountPaidKobo: amountKobo,
          paymentMethod: params.paymentMethod,
          totalPaidKobo: result.agreement.total_paid,
          totalAmountKobo: result.agreement.total_amount,
          balanceKobo: result.agreement.balance_remaining,
          percentPaid: result.agreement.percent_paid,
          magicLinkSlug: result.agreement.magic_link_slug,
        }).catch((err) => console.error("Payment receipt email warning:", err));
      });
    }

    return { success: true, payment: result.payment, agreement: result.agreement };
  } catch (err: any) {
    console.error("logPaymentAction error:", err);
    return { success: false, error: err.message || "Failed to log payment." };
  }
}

/**
 * 3. getDashboardStats
 * Aggregates active deals, collected this month, and outstanding balances for the logged-in merchant.
 */
export async function getDashboardStatsAction() {
  try {
    const merchantId = await requireMerchantId();
    const stats = await dbGetDashboardStats(merchantId);
    return { success: true, stats };
  } catch (err: any) {
    console.error("getDashboardStatsAction error:", err);
    return { success: false, error: err.message || "Failed to fetch dashboard stats." };
  }
}

/**
 * 4. getMagicLinkData
 * Public data access for customers via the 8-char slug.
 */
export async function getMagicLinkDataAction(slug: string) {
  try {
    if (!slug) return { success: false, error: "Slug is required" };
    const data = await dbGetMagicLinkData(slug);
    if (!data) return { success: false, error: "Agreement not found" };
    return { success: true, data };
  } catch (err: any) {
    console.error("getMagicLinkDataAction error:", err);
    return { success: false, error: err.message || "Failed to fetch magic link." };
  }
}

export async function getAgreementsListAction(filter?: { search?: string; status?: string }) {
  try {
    const merchantId = await requireMerchantId();
    const agreements = await dbGetAgreementsList(merchantId, filter);
    return { success: true, agreements };
  } catch (err: any) {
    console.error("getAgreementsListAction error:", err);
    return { success: false, error: err.message || "Failed to fetch agreements list." };
  }
}

export async function getAgreementDetailAction(agreementId: string) {
  try {
    const merchantId = await requireMerchantId();
    const data = await dbGetAgreementById(merchantId, agreementId);
    if (!data) return { success: false, error: "Agreement not found." };
    return { success: true, agreement: data.agreement, payments: data.payments };
  } catch (err: any) {
    console.error("getAgreementDetailAction error:", err);
    return { success: false, error: err.message || "Failed to fetch agreement details." };
  }
}

export async function getClientsListAction() {
  try {
    const merchantId = await requireMerchantId();
    const clients = await dbGetClientsList(merchantId);
    return { success: true, clients };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAgreementAction(params: {
  agreementId: string;
  title: string;
  totalAmountNaira: number | string;
  dueDate?: string;
  notes?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}) {
  try {
    const merchantId = await requireMerchantId();
    const totalAmountKobo = nairaToKobo(params.totalAmountNaira);

    if (!params.title || !params.clientName || !params.clientPhone) {
      return { success: false, error: "Title, client name, and phone are required." };
    }

    if (totalAmountKobo <= 0) {
      return { success: false, error: "Total amount must be greater than ₦0." };
    }

    const updated = await dbUpdateAgreement({
      merchantId,
      agreementId: params.agreementId,
      title: params.title,
      totalAmountKobo,
      dueDate: params.dueDate,
      notes: params.notes,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      clientEmail: params.clientEmail,
    });

    revalidatePath("/dashboard");
    revalidatePath("/agreements");
    revalidatePath(`/agreements/${params.agreementId}`);
    if (updated.magic_link_slug) {
      revalidatePath(`/c/${updated.magic_link_slug}`);
    }

    return { success: true, agreement: updated };
  } catch (err: any) {
    console.error("updateAgreementAction error:", err);
    return { success: false, error: err.message || "Failed to update agreement." };
  }
}

export async function deletePaymentAction(params: {
  agreementId: string;
  paymentId: string;
}) {
  try {
    const merchantId = await requireMerchantId();
    const result = await dbDeletePayment({
      merchantId,
      agreementId: params.agreementId,
      paymentId: params.paymentId,
    });

    revalidatePath("/dashboard");
    revalidatePath("/agreements");
    revalidatePath(`/agreements/${params.agreementId}`);
    if (result.agreement?.magic_link_slug) {
      revalidatePath(`/c/${result.agreement.magic_link_slug}`);
    }

    return { success: true, agreement: result.agreement };
  } catch (err: any) {
    console.error("deletePaymentAction error:", err);
    return { success: false, error: err.message || "Failed to delete payment." };
  }
}

