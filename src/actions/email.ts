"use server";

import { requireMerchantId } from "@/lib/auth/session";
import { getAgreementById } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email/service";
import { getAgreementCreatedEmailHtml } from "@/lib/email/templates";
import { formatNaira } from "@/lib/utils";

export async function sendManualReceiptEmailAction(params: {
  agreementId: string;
  recipientEmail: string;
}) {
  try {
    const merchantId = await requireMerchantId();
    const cleanEmail = params.recipientEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const data = await getAgreementById(merchantId, params.agreementId);
    if (!data) {
      return { success: false, error: "Agreement not found or unauthorized." };
    }

    const { agreement } = data;
    const origin = process.env.NEXTAUTH_URL || "https://neftrack.ng";
    const magicLinkUrl = `${origin}/c/${agreement.magic_link_slug}`;

    const html = getAgreementCreatedEmailHtml({
      clientName: agreement.client_name,
      businessName: "Your Merchant", // Will display cleanly
      itemTitle: agreement.title,
      totalAmountFormatted: formatNaira(agreement.total_amount),
      depositFormatted: formatNaira(agreement.total_paid),
      balanceFormatted: formatNaira(agreement.balance_remaining),
      dueDateFormatted: agreement.due_date ? new Date(agreement.due_date).toLocaleDateString() : undefined,
      magicLinkUrl,
    });

    const res = await sendEmail({
      to: cleanEmail,
      subject: `Part-Payment Receipt: ${agreement.title}`,
      html,
    });

    return { success: true, mocked: res.mocked };
  } catch (err: any) {
    console.error("sendManualReceiptEmailAction error:", err);
    return { success: false, error: err.message || "Failed to send email." };
  }
}
