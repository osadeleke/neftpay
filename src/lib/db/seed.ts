import { getD1Database } from "./d1-client";

export const DEMO_MERCHANT_ID = "mer_adebayo_ikeja_01";

export async function seedDemoDataIfNeeded(): Promise<void> {
  const db = getD1Database();

  // Check if merchant already exists
  const existing = await db
    .prepare("SELECT id FROM Merchants WHERE id = ?")
    .bind(DEMO_MERCHANT_ID)
    .first();

  if (existing) {
    return; // Already seeded
  }

  try {
    // 1. Insert Merchant
    await db
      .prepare(
        `INSERT INTO Merchants (id, business_name, phone_number, email, subscription_tier, currency)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        DEMO_MERCHANT_ID,
        "Adebayo Electronics & Solar",
        "08035552341",
        "adebayo@electronics.ng",
        "free",
        "NGN"
      )
      .run();

    // 2. Insert Clients
    const clients = [
      {
        id: "cli_chioma_01",
        merchant_id: DEMO_MERCHANT_ID,
        full_name: "Chioma Okonjo",
        phone_number: "08149998877",
        email: "chioma.o@gmail.com",
      },
      {
        id: "cli_emeka_02",
        merchant_id: DEMO_MERCHANT_ID,
        full_name: "Emeka Alabi",
        phone_number: "07082223344",
        email: "emeka.alabi@yahoo.com",
      },
      {
        id: "cli_fatima_03",
        merchant_id: DEMO_MERCHANT_ID,
        full_name: "Hajiya Fatima Bello",
        phone_number: "08021115566",
        email: "fatima.bello@gmail.com",
      },
      {
        id: "cli_tunde_04",
        merchant_id: DEMO_MERCHANT_ID,
        full_name: "Tunde Bakare",
        phone_number: "08167774433",
        email: "tunde.b@gmail.com",
      },
    ];

    for (const c of clients) {
      await db
        .prepare(
          `INSERT INTO Clients (id, merchant_id, full_name, phone_number, email)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(c.id, c.merchant_id, c.full_name, c.phone_number, c.email)
        .run();
    }

    // 3. Insert Agreements (amounts stored as KOBO integers: ₦1 = 100 kobo)
    const agreements = [
      {
        id: "agr_iph13_01",
        merchant_id: DEMO_MERCHANT_ID,
        client_id: "cli_chioma_01",
        title: "iPhone 13 Pro 128GB Sierra Blue",
        total_amount: 45000000, // ₦450,000
        magic_link_slug: "iph13pro",
        status: "active",
        due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
        notes: "Deposit of ₦150k paid, balance split across 3 weeks.",
      },
      {
        id: "agr_solar_02",
        merchant_id: DEMO_MERCHANT_ID,
        client_id: "cli_emeka_02",
        title: "Luminous 2.5kVA Solar Inverter + Battery",
        total_amount: 68000000, // ₦680,000
        magic_link_slug: "solr25kv",
        status: "overdue",
        due_date: new Date(Date.now() - 3 * 86400000).toISOString(),
        notes: "Final installment was due 3 days ago. Needs reminder.",
      },
      {
        id: "agr_tv_03",
        merchant_id: DEMO_MERCHANT_ID,
        client_id: "cli_fatima_03",
        title: "Hisense 55-inch 4K UHD Smart TV",
        total_amount: 32000000, // ₦320,000
        magic_link_slug: "hsn55tv4",
        status: "completed",
        due_date: new Date(Date.now() - 10 * 86400000).toISOString(),
        notes: "Fully paid on schedule. Item released with receipt.",
      },
      {
        id: "agr_laptop_04",
        merchant_id: DEMO_MERCHANT_ID,
        client_id: "cli_tunde_04",
        title: "HP EliteBook 840 G6 (Core i7, 16GB)",
        total_amount: 28000000, // ₦280,000
        magic_link_slug: "hp840g6x",
        status: "active",
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        notes: "₦100k initial downpayment. Remainder due on 30th.",
      },
    ];

    for (const a of agreements) {
      await db
        .prepare(
          `INSERT INTO Agreements (id, merchant_id, client_id, title, total_amount, magic_link_slug, status, due_date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          a.id,
          a.merchant_id,
          a.client_id,
          a.title,
          a.total_amount,
          a.magic_link_slug,
          a.status,
          a.due_date,
          a.notes
        )
        .run();
    }

    // 4. Insert Payments
    const payments = [
      // Chioma's iPhone: ₦150k + ₦100k = ₦250k paid (Balance ₦200k)
      {
        id: "pay_01",
        agreement_id: "agr_iph13_01",
        amount: 15000000,
        payment_method: "Bank Transfer",
        reference_note: "Initial commitment deposit via GTBank",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: "pay_02",
        agreement_id: "agr_iph13_01",
        amount: 10000000,
        payment_method: "Bank Transfer",
        reference_note: "Second installment via Kuda Bank",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      // Emeka's Solar: ₦200k + ₦180k = ₦380k paid (Balance ₦300k, Overdue)
      {
        id: "pay_03",
        agreement_id: "agr_solar_02",
        amount: 20000000,
        payment_method: "POS",
        reference_note: "Moniepoint POS in store",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: "pay_04",
        agreement_id: "agr_solar_02",
        amount: 18000000,
        payment_method: "Bank Transfer",
        reference_note: "Direct Zenith transfer",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      // Fatima's TV: ₦120k + ₦100k + ₦100k = ₦320k (Completed)
      {
        id: "pay_05",
        agreement_id: "agr_tv_03",
        amount: 12000000,
        payment_method: "Cash",
        reference_note: "Cash deposit received by store manager",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "pay_06",
        agreement_id: "agr_tv_03",
        amount: 10000000,
        payment_method: "Bank Transfer",
        reference_note: "Transfer ref: 0902847294",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: "pay_07",
        agreement_id: "agr_tv_03",
        amount: 10000000,
        payment_method: "Bank Transfer",
        reference_note: "Final payment settlement",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      // Tunde's HP EliteBook: ₦100k paid (Balance ₦180k)
      {
        id: "pay_08",
        agreement_id: "agr_laptop_04",
        amount: 10000000,
        payment_method: "Bank Transfer",
        reference_note: "Downpayment for laptop reserve",
        receipt_sent: 1,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    for (const p of payments) {
      await db
        .prepare(
          `INSERT INTO Payments (id, agreement_id, amount, payment_method, reference_note, receipt_sent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          p.id,
          p.agreement_id,
          p.amount,
          p.payment_method,
          p.reference_note,
          p.receipt_sent,
          p.created_at
        )
        .run();
    }

    console.log("Demo SME data successfully seeded for Adebayo Electronics!");
  } catch (err) {
    console.error("Error seeding demo data:", err);
  }
}
