/**
 * High-conversion, luxury African fintech responsive HTML email templates for NEFTrack.
 * Designed with Emerald (#008751), Electric Jade (#00D084), and Obsidian Slate (#0B111E).
 */

export interface EmailWrapperOptions {
  title: string;
  previewText: string;
  contentHtml: string;
}

export function wrapEmailHtml({ title, previewText, contentHtml }: EmailWrapperOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070B12;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #070B12;
      padding: 32px 16px;
    }
    .main {
      background-color: #0B111E;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #008751 0%, #005A36 100%);
      padding: 28px 24px;
      text-align: center;
    }
    .brand {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .tagline {
      color: rgba(255, 255, 255, 0.85);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-top: 4px;
      font-weight: 600;
    }
    .body {
      padding: 32px 28px;
    }
    .heading {
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .text {
      font-size: 14px;
      line-height: 22px;
      color: #94A3B8;
      margin-bottom: 20px;
    }
    .card {
      background-color: #101827;
      border: 1px solid rgba(0, 208, 132, 0.2);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #00D084;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 13px;
    }
    .metric-label {
      color: #94A3B8;
    }
    .metric-value {
      color: #FFFFFF;
      font-weight: 700;
      text-align: right;
    }
    .metric-highlight {
      color: #00D084;
      font-size: 18px;
      font-weight: 800;
    }
    .btn {
      display: block;
      width: 100%;
      box-sizing: border-box;
      background: linear-gradient(135deg, #00D084 0%, #008751 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      padding: 14px 20px;
      border-radius: 12px;
      margin: 24px 0 16px 0;
      box-shadow: 0 4px 14px rgba(0, 208, 132, 0.3);
    }
    .footer {
      padding: 20px 24px 28px 24px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .footer-text {
      font-size: 11px;
      color: #64748B;
      line-height: 16px;
      margin: 0;
    }
  </style>
</head>
<body>
  <span style="display:none;font-size:1px;color:#070B12;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </span>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1 class="brand">NEFTrack</h1>
        <div class="tagline">Smart Installment Tracking for Nigeria</div>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p class="footer-text">
          Sent by <strong>NEFTrack</strong> • Zero-marginal-cost installment tracking for Nigerian merchants.<br>
          Instant digital receipts powered by Cloudflare D1.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 1. Merchant Welcome Email
export function getMerchantWelcomeEmailHtml(params: {
  businessName: string;
  email: string;
  phone: string;
  dashboardUrl: string;
}): string {
  const content = `
    <h2 class="heading">Welcome to NEFTrack, ${params.businessName}! 🚀</h2>
    <p class="text">
      Your store installment ledger is officially ready. You can now log customer part-payments, track outstanding balances, and instantly share live digital receipts via WhatsApp.
    </p>

    <div class="card">
      <div class="card-title">Your Store Details</div>
      <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td class="metric-label" style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Store Name</td>
          <td class="metric-value" style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.businessName}</td>
        </tr>
        <tr>
          <td class="metric-label" style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">WhatsApp Phone</td>
          <td class="metric-value" style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.phone}</td>
        </tr>
        <tr>
          <td class="metric-label" style="color:#94A3B8; font-size:13px;">Login Email</td>
          <td class="metric-value" style="color:#00D084; font-weight:700; text-align:right; font-size:13px;">${params.email}</td>
        </tr>
      </table>
    </div>

    <div style="background-color:rgba(0, 208, 132, 0.08); border-left: 3px solid #00D084; padding: 14px 16px; border-radius: 6px; margin-bottom: 20px;">
      <div style="color:#00D084; font-weight:700; font-size:13px; margin-bottom:4px;">How It Works:</div>
      <div style="color:#CBD5E1; font-size:12px; line-height:18px;">
        1. Click <strong>"+ New Plan"</strong> to log an agreement (e.g. Phone, Laptop, Fabric).<br>
        2. Enter the customer's phone and initial deposit.<br>
        3. Click <strong>"Remind via WhatsApp"</strong> to send their read-only digital receipt!
      </div>
    </div>

    <a href="${params.dashboardUrl}" class="btn">Open My Store Dashboard →</a>
  `;

  return wrapEmailHtml({
    title: `Welcome to NEFTrack, ${params.businessName}!`,
    previewText: `Your store ledger is ready. Log installment agreements and share WhatsApp digital receipts.`,
    contentHtml: content,
  });
}

// 2. Installment Agreement Created Email
export function getAgreementCreatedEmailHtml(params: {
  clientName: string;
  businessName: string;
  itemTitle: string;
  totalAmountFormatted: string;
  depositFormatted: string;
  balanceFormatted: string;
  dueDateFormatted?: string;
  magicLinkUrl: string;
}): string {
  const content = `
    <h2 class="heading">Part-Payment Plan Confirmed! 🛍️</h2>
    <p class="text">
      Hello <strong>${params.clientName}</strong>, your part-payment purchase for <strong>"${params.itemTitle}"</strong> has been recorded with <strong>${params.businessName}</strong>.
    </p>

    <div class="card">
      <div class="card-title">Agreement Summary</div>
      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Merchant</td>
          <td style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.businessName}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Item / Service</td>
          <td style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.itemTitle}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Total Price</td>
          <td style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.totalAmountFormatted}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Initial Deposit Paid</td>
          <td style="color:#00D084; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.depositFormatted}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Outstanding Balance</td>
          <td style="color:#F59E0B; font-weight:800; font-size:15px; text-align:right; border-bottom:1px solid rgba(255,255,255,0.06);">${params.balanceFormatted}</td>
        </tr>
        ${params.dueDateFormatted ? `
        <tr>
          <td style="color:#94A3B8; font-size:13px;">Due Date</td>
          <td style="color:#CBD5E1; font-weight:600; text-align:right; font-size:13px;">${params.dueDateFormatted}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    <p class="text" style="font-size:13px;">
      You can view and verify all your installments anytime using your secure, permanent digital receipt link:
    </p>

    <a href="${params.magicLinkUrl}" class="btn">View My Live Digital Receipt →</a>
  `;

  return wrapEmailHtml({
    title: `Part-Payment Receipt: ${params.itemTitle}`,
    previewText: `Receipt for ${params.itemTitle} from ${params.businessName}. Balance: ${params.balanceFormatted}`,
    contentHtml: content,
  });
}

// 3. Payment Received / Installment Receipt Email
export function getPaymentReceiptEmailHtml(params: {
  clientName: string;
  businessName: string;
  itemTitle: string;
  amountPaidFormatted: string;
  paymentMethod: string;
  totalPaidFormatted: string;
  balanceFormatted: string;
  totalAmountFormatted: string;
  percentPaid: number;
  magicLinkUrl: string;
  isFullySettled: boolean;
}): string {
  const content = `
    <h2 class="heading">${params.isFullySettled ? '🎉 Payment Plan Fully Completed!' : 'Payment Receipt Confirmed ✅'}</h2>
    <p class="text">
      Hello <strong>${params.clientName}</strong>, a payment of <strong style="color:#00D084;">${params.amountPaidFormatted}</strong> has been confirmed by <strong>${params.businessName}</strong> for <strong>"${params.itemTitle}"</strong>.
    </p>

    <div class="card">
      <div class="card-title">Payment Breakdown</div>
      <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Amount Just Paid</td>
          <td style="color:#00D084; font-weight:800; font-size:16px; text-align:right; border-bottom:1px solid rgba(255,255,255,0.06);">${params.amountPaidFormatted}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Payment Method</td>
          <td style="color:#FFFFFF; font-weight:600; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.paymentMethod}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Total Paid to Date</td>
          <td style="color:#FFFFFF; font-weight:700; text-align:right; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">${params.totalPaidFormatted} of ${params.totalAmountFormatted}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.06);">Remaining Balance</td>
          <td style="color:${params.isFullySettled ? '#00D084' : '#F59E0B'}; font-weight:800; font-size:15px; text-align:right; border-bottom:1px solid rgba(255,255,255,0.06);">${params.balanceFormatted}</td>
        </tr>
        <tr>
          <td style="color:#94A3B8; font-size:13px;">Progress</td>
          <td style="color:#00D084; font-weight:700; text-align:right; font-size:13px;">${params.percentPaid}% Cleared</td>
        </tr>
      </table>
    </div>

    ${params.isFullySettled ? `
    <div style="background-color:rgba(0, 208, 132, 0.12); border: 1px solid #00D084; padding: 14px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
      <span style="color:#00D084; font-weight:800; font-size:14px;">🏆 Congratulations! This item is 100% paid off.</span>
    </div>
    ` : ''}

    <a href="${params.magicLinkUrl}" class="btn">View Updated Digital Receipt →</a>
  `;

  return wrapEmailHtml({
    title: `Payment Receipt: ${params.amountPaidFormatted} for ${params.itemTitle}`,
    previewText: `Confirmed payment of ${params.amountPaidFormatted} for ${params.itemTitle}. Balance: ${params.balanceFormatted}`,
    contentHtml: content,
  });
}
