/**
 * Cloudflare Native Email Dispatcher for NEFTrack.
 * Uses Cloudflare Email Service REST API (POST /accounts/{id}/email/sending/send)
 * and Cloudflare Worker send_email bindings, sharing the exact same
 * CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN used for Cloudflare D1.
 */

import {
  getMerchantWelcomeEmailHtml,
  getAgreementCreatedEmailHtml,
  getPaymentReceiptEmailHtml,
} from "./templates";
import { formatNaira } from "@/lib/utils";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "cloudflare" | "resend" | "mock";
  mocked?: boolean;
  error?: string;
}

/**
 * Core sendEmail dispatcher powered natively by Cloudflare Email Service
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<SendEmailResult> {
  const recipients = Array.isArray(to) ? to : [to];
  const validRecipients = recipients
    .map((r) => r.trim())
    .filter((r) => r.includes("@"));

  if (validRecipients.length === 0) {
    return { success: false, provider: "mock", error: "No valid email recipients provided." };
  }

  // Sender email address (should be from your domain configured in Cloudflare Email Sending)
  const fromAddress =
    from ||
    process.env.CLOUDFLARE_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    "notifications@neftrack.ng";

  // 1. Cloudflare Native Email Service (Primary)
  // Re-uses the existing Cloudflare Account ID and API Token configured for D1
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (cloudflareAccountId && cloudflareApiToken) {
    try {
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/email/sending/send`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cloudflareApiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: validRecipients.length === 1 ? validRecipients[0] : validRecipients,
          from: fromAddress,
          subject,
          html,
          text: text || subject,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        const errorMsg =
          data.errors?.[0]?.message ||
          data.message ||
          `Cloudflare Email HTTP ${response.status}`;
        console.error("Cloudflare Email Service API error:", data);
        return {
          success: false,
          provider: "cloudflare",
          error: errorMsg,
        };
      }

      console.log(
        `[CLOUDFLARE EMAIL DISPATCHED] To: ${validRecipients.join(", ")} | Subject: "${subject}"`
      );
      return {
        success: true,
        provider: "cloudflare",
        messageId: data.result?.id || `cf_${Date.now()}`,
      };
    } catch (err: any) {
      console.error("Failed to deliver email via Cloudflare Email Service:", err);
      return {
        success: false,
        provider: "cloudflare",
        error: err.message || "Network error connecting to Cloudflare Email API.",
      };
    }
  }

  // 2. Optional Resend Fallback (if user configured RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: validRecipients,
          subject,
          html,
          text: text || subject,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, provider: "resend", messageId: data.id };
      }
    } catch (err: any) {
      console.error("Resend fallback warning:", err);
    }
  }

  // 3. Local Development / Sandbox Mock Mode
  // If no Cloudflare API token is set during local development, safely log to console
  console.log("--------------------------------------------------");
  console.log(`📧 [CLOUDFLARE EMAIL TRIGGER FIRED (Dev Mode)]`);
  console.log(`To:       ${validRecipients.join(", ")}`);
  console.log(`From:     ${fromAddress}`);
  console.log(`Subject:  ${subject}`);
  console.log(
    `Engine:   Cloudflare Email Service (Set CLOUDFLARE_ACCOUNT_ID & CLOUDFLARE_API_TOKEN in .env)`
  );
  console.log("--------------------------------------------------");

  return {
    success: true,
    provider: "mock",
    mocked: true,
    messageId: `cf_mock_${Date.now()}`,
  };
}

/**
 * Trigger 1: Merchant Welcome Email
 */
export async function triggerMerchantWelcomeEmail(params: {
  businessName: string;
  email: string;
  phone: string;
  baseUrl?: string;
}) {
  const origin = params.baseUrl || process.env.NEXTAUTH_URL || "https://neftrack.ng";
  const dashboardUrl = `${origin}/dashboard`;

  const html = getMerchantWelcomeEmailHtml({
    businessName: params.businessName,
    email: params.email,
    phone: params.phone,
    dashboardUrl,
  });

  return sendEmail({
    to: params.email,
    subject: `Welcome to NEFTrack, ${params.businessName}! 🚀`,
    html,
  });
}

/**
 * Trigger 2: Agreement & Initial Deposit Created Email
 */
export async function triggerAgreementCreatedEmail(params: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  itemTitle: string;
  totalAmountKobo: number;
  depositKobo: number;
  balanceKobo: number;
  dueDate?: string;
  magicLinkSlug: string;
  baseUrl?: string;
}) {
  const origin = params.baseUrl || process.env.NEXTAUTH_URL || "https://neftrack.ng";
  const magicLinkUrl = `${origin}/c/${params.magicLinkSlug}`;

  const html = getAgreementCreatedEmailHtml({
    clientName: params.clientName,
    businessName: params.businessName,
    itemTitle: params.itemTitle,
    totalAmountFormatted: formatNaira(params.totalAmountKobo),
    depositFormatted: formatNaira(params.depositKobo),
    balanceFormatted: formatNaira(params.balanceKobo),
    dueDateFormatted: params.dueDate ? new Date(params.dueDate).toLocaleDateString() : undefined,
    magicLinkUrl,
  });

  return sendEmail({
    to: params.clientEmail,
    subject: `Part-Payment Receipt: ${params.itemTitle} (${params.businessName})`,
    html,
  });
}

/**
 * Trigger 3: Payment Receipt Email
 */
export async function triggerPaymentReceiptEmail(params: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  itemTitle: string;
  amountPaidKobo: number;
  paymentMethod: string;
  totalPaidKobo: number;
  totalAmountKobo: number;
  balanceKobo: number;
  percentPaid: number;
  magicLinkSlug: string;
  baseUrl?: string;
}) {
  const origin = params.baseUrl || process.env.NEXTAUTH_URL || "https://neftrack.ng";
  const magicLinkUrl = `${origin}/c/${params.magicLinkSlug}`;
  const isFullySettled = params.balanceKobo <= 0;

  const html = getPaymentReceiptEmailHtml({
    clientName: params.clientName,
    businessName: params.businessName,
    itemTitle: params.itemTitle,
    amountPaidFormatted: formatNaira(params.amountPaidKobo),
    paymentMethod: params.paymentMethod,
    totalPaidFormatted: formatNaira(params.totalPaidKobo),
    balanceFormatted: formatNaira(params.balanceKobo),
    totalAmountFormatted: formatNaira(params.totalAmountKobo),
    percentPaid: params.percentPaid,
    magicLinkUrl,
    isFullySettled,
  });

  const subject = isFullySettled
    ? `🎉 Paid in Full! Final Receipt for ${params.itemTitle} (${params.businessName})`
    : `Payment Receipt: ${formatNaira(params.amountPaidKobo)} for ${params.itemTitle}`;

  return sendEmail({
    to: params.clientEmail,
    subject,
    html,
  });
}
