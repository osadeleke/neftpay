"use server";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { getD1Database } from "@/lib/db/d1-client";
import { DEMO_MERCHANT_ID } from "@/lib/db/seed";
import { redirect } from "next/navigation";

export async function loginWithEmailAction(email: string, businessName?: string) {
  const cleanEmail = email.toLowerCase().trim();
  const db = getD1Database();

  let merchant = await db
    .prepare("SELECT * FROM Merchants WHERE email = ?")
    .bind(cleanEmail)
    .first<any>();

  if (!merchant) {
    const id = `mer_${crypto.randomUUID().slice(0, 12)}`;
    const bName = businessName?.trim() || `${cleanEmail.split("@")[0]}'s Enterprise`;
    await db
      .prepare(
        `INSERT INTO Merchants (id, business_name, phone_number, email, subscription_tier)
         VALUES (?, ?, ?, ?, 'free')`
      )
      .bind(id, bName, "08012345678", cleanEmail)
      .run();

    merchant = {
      id,
      business_name: bName,
      phone_number: "08012345678",
      email: cleanEmail,
    };
  }

  await setSessionCookie({
    id: merchant.id,
    email: merchant.email,
    name: merchant.business_name,
    business_name: merchant.business_name,
    phone_number: merchant.phone_number,
  });

  return { success: true };
}

export async function loginAsDemoMerchantAction() {
  const db = getD1Database();
  const merchant = await db
    .prepare("SELECT * FROM Merchants WHERE id = ?")
    .bind(DEMO_MERCHANT_ID)
    .first<any>();

  if (merchant) {
    await setSessionCookie({
      id: merchant.id,
      email: merchant.email,
      name: merchant.business_name,
      business_name: merchant.business_name,
      phone_number: merchant.phone_number,
    });
  } else {
    await setSessionCookie({
      id: DEMO_MERCHANT_ID,
      email: "adebayo@electronics.ng",
      name: "Adebayo Alabi",
      business_name: "Adebayo Electronics & Solar",
      phone_number: "08035552341",
    });
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
