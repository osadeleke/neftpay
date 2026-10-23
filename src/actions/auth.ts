"use server";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { getD1Database } from "@/lib/db/d1-client";
import { DEMO_MERCHANT_ID, seedDemoDataIfNeeded } from "@/lib/db/seed";
import { triggerMerchantWelcomeEmail } from "@/lib/email/service";
import { redirect } from "next/navigation";

export async function registerMerchantAction(params: {
  businessName: string;
  phoneNumber: string;
  email: string;
}) {
  const cleanEmail = params.email.toLowerCase().trim();
  const cleanBusiness = params.businessName.trim();
  const cleanPhone = params.phoneNumber.trim();

  if (!cleanBusiness || !cleanPhone || !cleanEmail) {
    return { success: false, error: "Please provide store name, phone number, and email." };
  }

  const db = getD1Database();

  // Check if merchant with this email already exists
  let merchant = await db
    .prepare("SELECT * FROM Merchants WHERE email = ?")
    .bind(cleanEmail)
    .first<any>();

  if (!merchant) {
    const id = `mer_${crypto.randomUUID().slice(0, 12)}`;
    await db
      .prepare(
        `INSERT INTO Merchants (id, business_name, phone_number, email, subscription_tier)
         VALUES (?, ?, ?, ?, 'free')`
      )
      .bind(id, cleanBusiness, cleanPhone, cleanEmail)
      .run();

    merchant = {
      id,
      business_name: cleanBusiness,
      phone_number: cleanPhone,
      email: cleanEmail,
    };
  } else {
    // Update store name and phone if provided
    await db
      .prepare(
        "UPDATE Merchants SET business_name = ?, phone_number = ? WHERE id = ?"
      )
      .bind(cleanBusiness, cleanPhone, merchant.id)
      .run();
    merchant.business_name = cleanBusiness;
    merchant.phone_number = cleanPhone;
  }

  await setSessionCookie({
    id: merchant.id,
    email: merchant.email,
    name: merchant.business_name,
    business_name: merchant.business_name,
    phone_number: merchant.phone_number,
  });

  // Trigger welcome email asynchronously (non-blocking)
  triggerMerchantWelcomeEmail({
    businessName: merchant.business_name,
    email: merchant.email,
    phone: merchant.phone_number,
  }).catch((err) => console.error("Welcome email trigger warning:", err));

  return { success: true };
}

export async function loginWithEmailAction(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  const db = getD1Database();

  const merchant = await db
    .prepare("SELECT * FROM Merchants WHERE email = ?")
    .bind(cleanEmail)
    .first<any>();

  if (!merchant) {
    return {
      success: false,
      notFound: true,
      error: "No store found with this email. Please register your store.",
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
  await seedDemoDataIfNeeded();
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
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
