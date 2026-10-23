import { getD1Database } from "./d1-client";
import {
  Agreement,
  AgreementWithDetails,
  Client,
  DashboardStats,
  MagicLinkData,
  Payment,
  AdminPlatformMetrics,
  AdminMerchantMetric,
  AdminGlobalPayment,
} from "@/types";
import { generateMagicSlug } from "@/lib/utils";
import crypto from "crypto";

export async function getDashboardStats(merchantId: string): Promise<DashboardStats> {
  const db = getD1Database();

  // 1. Fetch all agreements with their payments for this merchant
  const agreementsRes = await db
    .prepare(
      `SELECT 
        a.*,
        c.full_name AS client_name,
        c.phone_number AS client_phone,
        c.email AS client_email,
        COALESCE(SUM(p.amount), 0) AS total_paid,
        COUNT(p.id) AS payments_count,
        MAX(p.created_at) AS last_payment_date
      FROM Agreements a
      JOIN Clients c ON a.client_id = c.id
      LEFT JOIN Payments p ON a.id = p.agreement_id
      WHERE a.merchant_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC`
    )
    .bind(merchantId)
    .all<any>();

  const agreements = agreementsRes.results || [];

  let totalOutstandingKobo = 0;
  let activeClientsSet = new Set<string>();
  let activeAgreementsCount = 0;
  let completedAgreementsCount = 0;
  const overdueAgreements: AgreementWithDetails[] = [];
  const processedAgreements: AgreementWithDetails[] = [];

  const now = new Date().toISOString();

  for (const row of agreements) {
    const totalAmount = Number(row.total_amount);
    const totalPaid = Number(row.total_paid);
    const balanceRemaining = Math.max(0, totalAmount - totalPaid);
    const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

    let computedStatus = row.status;
    if (balanceRemaining === 0) {
      computedStatus = "completed";
    } else if (row.due_date && row.due_date < now) {
      computedStatus = "overdue";
    }

    const item: AgreementWithDetails = {
      ...row,
      status: computedStatus,
      total_amount: totalAmount,
      total_paid: totalPaid,
      balance_remaining: balanceRemaining,
      percent_paid: percentPaid,
      payments_count: Number(row.payments_count),
    };

    processedAgreements.push(item);

    if (computedStatus === "completed") {
      completedAgreementsCount++;
    } else {
      activeAgreementsCount++;
      totalOutstandingKobo += balanceRemaining;
      activeClientsSet.add(row.client_id);

      if (computedStatus === "overdue" || (row.due_date && row.due_date < now)) {
        overdueAgreements.push(item);
      }
    }
  }

  // 2. Fetch payments collected this month for this merchant
  // Using SQLite strftime for month comparison
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString();

  const collectedRes = await db
    .prepare(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_month
       FROM Payments p
       JOIN Agreements a ON p.agreement_id = a.id
       WHERE a.merchant_id = ? AND p.created_at >= ?`
    )
    .bind(merchantId, monthStartIso)
    .first<{ total_month: number }>();

  const collectedThisMonthKobo = Number(collectedRes?.total_month || 0);

  return {
    totalOutstandingBalanceKobo: totalOutstandingKobo,
    collectedThisMonthKobo,
    activeClientsCount: activeClientsSet.size,
    activeAgreementsCount,
    completedAgreementsCount,
    overdueAgreements,
    recentAgreements: processedAgreements.slice(0, 10),
  };
}

export async function getAgreementsList(
  merchantId: string,
  filter?: { search?: string; status?: string }
): Promise<AgreementWithDetails[]> {
  const db = getD1Database();

  const res = await db
    .prepare(
      `SELECT 
        a.*,
        c.full_name AS client_name,
        c.phone_number AS client_phone,
        c.email AS client_email,
        COALESCE(SUM(p.amount), 0) AS total_paid,
        COUNT(p.id) AS payments_count,
        MAX(p.created_at) AS last_payment_date
      FROM Agreements a
      JOIN Clients c ON a.client_id = c.id
      LEFT JOIN Payments p ON a.id = p.agreement_id
      WHERE a.merchant_id = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC`
    )
    .bind(merchantId)
    .all<any>();

  const now = new Date().toISOString();
  let list = (res.results || []).map((row) => {
    const totalAmount = Number(row.total_amount);
    const totalPaid = Number(row.total_paid);
    const balanceRemaining = Math.max(0, totalAmount - totalPaid);
    const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

    let computedStatus = row.status;
    if (balanceRemaining === 0) {
      computedStatus = "completed";
    } else if (row.due_date && row.due_date < now) {
      computedStatus = "overdue";
    }

    return {
      ...row,
      status: computedStatus,
      total_amount: totalAmount,
      total_paid: totalPaid,
      balance_remaining: balanceRemaining,
      percent_paid: percentPaid,
      payments_count: Number(row.payments_count),
    } as AgreementWithDetails;
  });

  if (filter?.status && filter.status !== "all") {
    list = list.filter((a) => a.status === filter.status);
  }

  if (filter?.search && filter.search.trim() !== "") {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.client_name.toLowerCase().includes(q) ||
        a.client_phone.includes(q) ||
        a.magic_link_slug.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getAgreementById(
  merchantId: string,
  agreementId: string
): Promise<{ agreement: AgreementWithDetails; payments: Payment[] } | null> {
  const db = getD1Database();

  const agreementRow = await db
    .prepare(
      `SELECT 
        a.*,
        c.full_name AS client_name,
        c.phone_number AS client_phone,
        c.email AS client_email
      FROM Agreements a
      JOIN Clients c ON a.client_id = c.id
      WHERE a.id = ? AND a.merchant_id = ?`
    )
    .bind(agreementId, merchantId)
    .first<any>();

  if (!agreementRow) {
    return null;
  }

  const paymentsRes = await db
    .prepare(
      `SELECT * FROM Payments 
       WHERE agreement_id = ? 
       ORDER BY created_at DESC`
    )
    .bind(agreementId)
    .all<Payment>();

  const payments = paymentsRes.results || [];
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAmount = Number(agreementRow.total_amount);
  const balanceRemaining = Math.max(0, totalAmount - totalPaid);
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  const now = new Date().toISOString();
  let computedStatus = agreementRow.status;
  if (balanceRemaining === 0) {
    computedStatus = "completed";
  } else if (agreementRow.due_date && agreementRow.due_date < now) {
    computedStatus = "overdue";
  }

  const agreement: AgreementWithDetails = {
    ...agreementRow,
    status: computedStatus,
    total_amount: totalAmount,
    total_paid: totalPaid,
    balance_remaining: balanceRemaining,
    percent_paid: percentPaid,
    payments_count: payments.length,
    last_payment_date: payments[0]?.created_at || null,
  };

  return { agreement, payments };
}

export async function getMagicLinkData(slug: string): Promise<MagicLinkData | null> {
  const db = getD1Database();

  const row = await db
    .prepare(
      `SELECT 
        a.*,
        c.full_name AS client_name,
        c.phone_number AS client_phone,
        c.email AS client_email,
        m.id AS merchant_id,
        m.business_name AS merchant_business_name,
        m.phone_number AS merchant_phone,
        m.email AS merchant_email,
        m.address AS merchant_address
      FROM Agreements a
      JOIN Merchants m ON a.merchant_id = m.id
      JOIN Clients c ON a.client_id = c.id
      WHERE a.magic_link_slug = ?`
    )
    .bind(slug)
    .first<any>();

  if (!row) {
    return null;
  }

  const paymentsRes = await db
    .prepare(
      `SELECT * FROM Payments 
       WHERE agreement_id = ? 
       ORDER BY created_at DESC`
    )
    .bind(row.id)
    .all<Payment>();

  const payments = paymentsRes.results || [];
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalAmount = Number(row.total_amount);
  const balanceRemaining = Math.max(0, totalAmount - totalPaid);
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  return {
    agreement: {
      id: row.id,
      merchant_id: row.merchant_id,
      client_id: row.client_id,
      title: row.title,
      total_amount: totalAmount,
      magic_link_slug: row.magic_link_slug,
      status: balanceRemaining === 0 ? "completed" : row.status,
      due_date: row.due_date,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    client: {
      full_name: row.client_name,
      phone_number: row.client_phone,
      email: row.client_email,
    },
    merchant: {
      id: row.merchant_id,
      business_name: row.merchant_business_name,
      phone_number: row.merchant_phone,
      email: row.merchant_email,
      address: row.merchant_address || null,
    },
    payments,
    totalPaidKobo: totalPaid,
    balanceRemainingKobo: balanceRemaining,
    percentPaid,
    isCompleted: balanceRemaining === 0,
  };
}

export async function createAgreement(params: {
  merchantId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  title: string;
  totalAmountKobo: number;
  initialDepositKobo?: number;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}): Promise<AgreementWithDetails> {
  const db = getD1Database();

  // 1. Find or create Client for this merchant
  let clientId: string;
  const existingClient = await db
    .prepare("SELECT id FROM Clients WHERE merchant_id = ? AND phone_number = ?")
    .bind(params.merchantId, params.clientPhone.trim())
    .first<{ id: string }>();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    clientId = `cli_${crypto.randomUUID().slice(0, 12)}`;
    await db
      .prepare(
        `INSERT INTO Clients (id, merchant_id, full_name, phone_number, email)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        clientId,
        params.merchantId,
        params.clientName.trim(),
        params.clientPhone.trim(),
        params.clientEmail?.trim() || null
      )
      .run();
  }

  // 2. Generate unique 8-character slug
  let slug = generateMagicSlug(8);
  let attempts = 0;
  while (attempts < 5) {
    const collision = await db
      .prepare("SELECT id FROM Agreements WHERE magic_link_slug = ?")
      .bind(slug)
      .first();
    if (!collision) break;
    slug = generateMagicSlug(8);
    attempts++;
  }

  const agreementId = `agr_${crypto.randomUUID().slice(0, 12)}`;
  const initialDeposit = Math.max(0, params.initialDepositKobo || 0);
  const status = initialDeposit >= params.totalAmountKobo ? "completed" : "active";

  // 3. Insert Agreement
  await db
    .prepare(
      `INSERT INTO Agreements (id, merchant_id, client_id, title, total_amount, magic_link_slug, status, due_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      agreementId,
      params.merchantId,
      clientId,
      params.title.trim(),
      params.totalAmountKobo,
      slug,
      status,
      params.dueDate || null,
      params.notes?.trim() || null
    )
    .run();

  // 4. Log initial payment if deposit provided
  if (initialDeposit > 0) {
    const paymentId = `pay_${crypto.randomUUID().slice(0, 12)}`;
    await db
      .prepare(
        `INSERT INTO Payments (id, agreement_id, amount, payment_method, reference_note, receipt_sent)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        paymentId,
        agreementId,
        initialDeposit,
        params.paymentMethod || "Bank Transfer",
        "Initial down payment / commitment deposit",
        1
      )
      .run();
  }

  const balanceRemaining = Math.max(0, params.totalAmountKobo - initialDeposit);
  const percentPaid =
    params.totalAmountKobo > 0
      ? Math.min(100, Math.round((initialDeposit / params.totalAmountKobo) * 100))
      : 0;

  return {
    id: agreementId,
    merchant_id: params.merchantId,
    client_id: clientId,
    client_name: params.clientName,
    client_phone: params.clientPhone,
    client_email: params.clientEmail || null,
    title: params.title,
    total_amount: params.totalAmountKobo,
    magic_link_slug: slug,
    status,
    due_date: params.dueDate || null,
    notes: params.notes || null,
    created_at: new Date().toISOString(),
    total_paid: initialDeposit,
    balance_remaining: balanceRemaining,
    percent_paid: percentPaid,
    payments_count: initialDeposit > 0 ? 1 : 0,
    last_payment_date: initialDeposit > 0 ? new Date().toISOString() : null,
  };
}

export async function logPayment(params: {
  merchantId: string;
  agreementId: string;
  amountKobo: number;
  paymentMethod: string;
  referenceNote?: string;
  receiptSent?: boolean;
}): Promise<{ payment: Payment; agreement: AgreementWithDetails }> {
  const db = getD1Database();

  // Verify ownership
  const agreement = await db
    .prepare("SELECT * FROM Agreements WHERE id = ? AND merchant_id = ?")
    .bind(params.agreementId, params.merchantId)
    .first<Agreement>();

  if (!agreement) {
    throw new Error("Agreement not found or unauthorized.");
  }

  const paymentId = `pay_${crypto.randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO Payments (id, agreement_id, amount, payment_method, reference_note, receipt_sent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      paymentId,
      params.agreementId,
      params.amountKobo,
      params.paymentMethod,
      params.referenceNote?.trim() || null,
      params.receiptSent ? 1 : 1, // default 1 for immediate whatsapp receipt flow
      now
    )
    .run();

  // Check updated total
  const paymentsRes = await db
    .prepare("SELECT SUM(amount) AS total_paid FROM Payments WHERE agreement_id = ?")
    .bind(params.agreementId)
    .first<{ total_paid: number }>();

  const totalPaid = Number(paymentsRes?.total_paid || 0);
  const totalAmount = Number(agreement.total_amount);

  let newStatus = agreement.status;
  if (totalPaid >= totalAmount) {
    newStatus = "completed";
    await db
      .prepare("UPDATE Agreements SET status = 'completed', updated_at = ? WHERE id = ?")
      .bind(now, params.agreementId)
      .run();
  }

  const full = await getAgreementById(params.merchantId, params.agreementId);
  if (!full) {
    throw new Error("Failed to retrieve updated agreement.");
  }

  const payment: Payment = {
    id: paymentId,
    agreement_id: params.agreementId,
    amount: params.amountKobo,
    payment_method: params.paymentMethod,
    reference_note: params.referenceNote || null,
    receipt_sent: 1,
    created_at: now,
  };

  return { payment, agreement: full.agreement };
}

export async function getClientsList(merchantId: string): Promise<Client[]> {
  const db = getD1Database();
  const res = await db
    .prepare("SELECT * FROM Clients WHERE merchant_id = ? ORDER BY full_name ASC")
    .bind(merchantId)
    .all<Client>();
  return res.results || [];
}

export async function getMerchantProfile(merchantId: string) {
  const db = getD1Database();
  return db
    .prepare("SELECT * FROM Merchants WHERE id = ?")
    .bind(merchantId)
    .first();
}

export async function updateMerchantProfile(
  merchantId: string,
  businessName: string,
  phoneNumber: string
) {
  const db = getD1Database();
  await db
    .prepare(
      "UPDATE Merchants SET business_name = ?, phone_number = ? WHERE id = ?"
    )
    .bind(businessName.trim(), phoneNumber.trim(), merchantId)
    .run();
}

export async function updateAgreement(params: {
  merchantId: string;
  agreementId: string;
  title: string;
  totalAmountKobo: number;
  dueDate?: string;
  notes?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
}): Promise<AgreementWithDetails> {
  const db = getD1Database();

  const existing = await db
    .prepare("SELECT * FROM Agreements WHERE id = ? AND merchant_id = ?")
    .bind(params.agreementId, params.merchantId)
    .first<any>();

  if (!existing) {
    throw new Error("Agreement not found or unauthorized.");
  }

  // 1. Update Client info
  await db
    .prepare("UPDATE Clients SET full_name = ?, phone_number = ?, email = ? WHERE id = ? AND merchant_id = ?")
    .bind(
      params.clientName.trim(),
      params.clientPhone.trim(),
      params.clientEmail?.trim() || null,
      existing.client_id,
      params.merchantId
    )
    .run();

  // 2. Calculate payments to re-assess status
  const paymentsRes = await db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total_paid FROM Payments WHERE agreement_id = ?")
    .bind(params.agreementId)
    .first<{ total_paid: number }>();

  const totalPaid = Number(paymentsRes?.total_paid || 0);
  const now = new Date().toISOString();
  let status = existing.status;

  if (totalPaid >= params.totalAmountKobo) {
    status = "completed";
  } else if (params.dueDate && params.dueDate < now) {
    status = "overdue";
  } else {
    status = "active";
  }

  // 3. Update Agreement
  await db
    .prepare(
      `UPDATE Agreements
       SET title = ?, total_amount = ?, due_date = ?, notes = ?, status = ?, updated_at = ?
       WHERE id = ? AND merchant_id = ?`
    )
    .bind(
      params.title.trim(),
      params.totalAmountKobo,
      params.dueDate || null,
      params.notes?.trim() || null,
      status,
      now,
      params.agreementId,
      params.merchantId
    )
    .run();

  const full = await getAgreementById(params.merchantId, params.agreementId);
  if (!full) {
    throw new Error("Failed to load updated agreement.");
  }
  return full.agreement;
}

export async function deletePayment(params: {
  merchantId: string;
  agreementId: string;
  paymentId: string;
}): Promise<{ success: boolean; agreement: AgreementWithDetails }> {
  const db = getD1Database();

  // Verify ownership
  const agreement = await db
    .prepare("SELECT * FROM Agreements WHERE id = ? AND merchant_id = ?")
    .bind(params.agreementId, params.merchantId)
    .first<any>();

  if (!agreement) {
    throw new Error("Agreement not found or unauthorized.");
  }

  // Delete payment
  await db
    .prepare("DELETE FROM Payments WHERE id = ? AND agreement_id = ?")
    .bind(params.paymentId, params.agreementId)
    .run();

  // Re-assess total paid and status
  const paymentsRes = await db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total_paid FROM Payments WHERE agreement_id = ?")
    .bind(params.agreementId)
    .first<{ total_paid: number }>();

  const totalPaid = Number(paymentsRes?.total_paid || 0);
  const totalAmount = Number(agreement.total_amount);
  const now = new Date().toISOString();

  let newStatus = "active";
  if (totalPaid >= totalAmount) {
    newStatus = "completed";
  } else if (agreement.due_date && agreement.due_date < now) {
    newStatus = "overdue";
  }

  await db
    .prepare("UPDATE Agreements SET status = ?, updated_at = ? WHERE id = ?")
    .bind(newStatus, now, params.agreementId)
    .run();

  const full = await getAgreementById(params.merchantId, params.agreementId);
  if (!full) {
    throw new Error("Failed to load updated agreement.");
  }

  return { success: true, agreement: full.agreement };
}

export async function getAdminPlatformMetrics(): Promise<AdminPlatformMetrics> {
  const db = getD1Database();

  // 1. Overall Platform Aggregates
  const agreementsAgg = await db
    .prepare(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_tracked, COUNT(id) AS total_agreements FROM Agreements"
    )
    .first<any>();

  const paymentsAgg = await db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) AS total_collected, COUNT(id) AS total_payments FROM Payments"
    )
    .first<any>();

  const merchantsCount = await db
    .prepare("SELECT COUNT(id) AS total_merchants FROM Merchants")
    .first<any>();

  const clientsCount = await db
    .prepare("SELECT COUNT(id) AS total_clients FROM Clients")
    .first<any>();

  const totalTracked = Number(agreementsAgg?.total_tracked || 0);
  const totalCollected = Number(paymentsAgg?.total_collected || 0);
  const totalOutstanding = Math.max(0, totalTracked - totalCollected);

  // 2. Merchant Breakdown
  const merchantsRes = await db
    .prepare(
      `SELECT 
        m.id,
        m.business_name,
        m.phone_number,
        m.email,
        m.subscription_tier,
        m.created_at,
        (SELECT COUNT(*) FROM Agreements a WHERE a.merchant_id = m.id) AS agreements_count,
        (SELECT COUNT(*) FROM Clients c WHERE c.merchant_id = m.id) AS clients_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM Agreements a WHERE a.merchant_id = m.id) AS total_tracked_kobo,
        (SELECT COALESCE(SUM(p.amount), 0) FROM Payments p JOIN Agreements a ON p.agreement_id = a.id WHERE a.merchant_id = m.id) AS total_collected_kobo
      FROM Merchants m
      ORDER BY m.created_at DESC`
    )
    .all<any>();

  const merchants: AdminMerchantMetric[] = (merchantsRes.results || []).map((row) => {
    const tracked = Number(row.total_tracked_kobo || 0);
    const collected = Number(row.total_collected_kobo || 0);
    return {
      id: row.id,
      business_name: row.business_name,
      phone_number: row.phone_number,
      email: row.email,
      subscription_tier: row.subscription_tier || "free",
      created_at: row.created_at,
      agreements_count: Number(row.agreements_count || 0),
      clients_count: Number(row.clients_count || 0),
      total_tracked_kobo: tracked,
      total_collected_kobo: collected,
      total_outstanding_kobo: Math.max(0, tracked - collected),
    };
  });

  // 3. Recent Global Payments across the ecosystem
  const recentPaymentsRes = await db
    .prepare(
      `SELECT 
        p.id,
        p.amount,
        p.payment_method,
        p.reference_note,
        p.created_at,
        a.title AS agreement_title,
        c.full_name AS client_name,
        m.business_name AS merchant_business_name
      FROM Payments p
      JOIN Agreements a ON p.agreement_id = a.id
      JOIN Clients c ON a.client_id = c.id
      JOIN Merchants m ON a.merchant_id = m.id
      ORDER BY p.created_at DESC
      LIMIT 20`
    )
    .all<any>();

  const recentPayments: AdminGlobalPayment[] = (recentPaymentsRes.results || []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    payment_method: p.payment_method,
    reference_note: p.reference_note || null,
    created_at: p.created_at,
    agreement_title: p.agreement_title,
    client_name: p.client_name,
    merchant_business_name: p.merchant_business_name,
  }));

  return {
    totalVolumeTrackedKobo: totalTracked,
    totalCollectedKobo: totalCollected,
    totalOutstandingKobo: totalOutstanding,
    totalMerchantsCount: Number(merchantsCount?.total_merchants || 0),
    totalClientsCount: Number(clientsCount?.total_clients || 0),
    totalAgreementsCount: Number(agreementsAgg?.total_agreements || 0),
    totalPaymentsCount: Number(paymentsAgg?.total_payments || 0),
    merchants,
    recentPayments,
  };
}
