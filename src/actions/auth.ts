"use server";

import { clearSessionCookie, setSessionCookie, requireMerchantId, getSession } from "@/lib/auth/session";
import { getD1Database } from "@/lib/db/d1-client";
import { triggerMerchantWelcomeEmail, sendEmail } from "@/lib/email/service";
import { getLoginOtpEmailHtml } from "@/lib/email/templates";
import { hashPassword, verifyPassword, generateOtpCode } from "@/lib/auth/password";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function registerMerchantAction(params: {
  businessName: string;
  phoneNumber: string;
  email: string;
  password: string;
  address?: string;
}) {
  const cleanEmail = params.email.toLowerCase().trim();
  const cleanBusiness = params.businessName.trim();
  const cleanPhone = params.phoneNumber.trim();
  const cleanAddress = params.address?.trim() || null;
  const password = params.password;

  if (!cleanBusiness || !cleanPhone || !cleanEmail || !password) {
    return { success: false, error: "Please fill in all required fields including a password." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const db = getD1Database();

  // Check if merchant with this email already exists
  const existing = await db
    .prepare("SELECT * FROM Merchants WHERE email = ?")
    .bind(cleanEmail)
    .first<any>();

  if (existing) {
    return {
      success: false,
      error: "A store with this email already exists. Please sign in instead.",
    };
  }

  const id = `mer_${crypto.randomUUID().slice(0, 12)}`;
  const passwordHash = hashPassword(password);

  await db
    .prepare(
      `INSERT INTO Merchants (id, business_name, phone_number, email, password_hash, address, subscription_tier)
       VALUES (?, ?, ?, ?, ?, ?, 'free')`
    )
    .bind(id, cleanBusiness, cleanPhone, cleanEmail, passwordHash, cleanAddress)
    .run();

  await setSessionCookie({
    id,
    email: cleanEmail,
    name: cleanBusiness,
    business_name: cleanBusiness,
    phone_number: cleanPhone,
    address: cleanAddress,
  });

  // Trigger welcome email asynchronously via Cloudflare Native Email
  triggerMerchantWelcomeEmail({
    businessName: cleanBusiness,
    email: cleanEmail,
    phone: cleanPhone,
  }).catch((err) => console.error("Welcome email trigger warning:", err));

  return { success: true };
}

export async function loginWithPasswordAction(params: {
  email: string;
  password: string;
}) {
  const cleanEmail = params.email.toLowerCase().trim();
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

  // If merchant has a password set, verify it
  if (merchant.password_hash) {
    const isValid = verifyPassword(params.password, merchant.password_hash);
    if (!isValid) {
      return {
        success: false,
        error: "Incorrect password. Please verify or use 6-digit email code.",
      };
    }
  } else {
    // If merchant was registered before passwords, require OTP code to sign in
    return {
      success: false,
      requiresOtp: true,
      error: "Please sign in with a 6-digit email code to set your new store password.",
    };
  }

  await setSessionCookie({
    id: merchant.id,
    email: merchant.email,
    name: merchant.business_name,
    business_name: merchant.business_name,
    phone_number: merchant.phone_number,
    address: merchant.address || null,
  });

  return { success: true };
}

/**
 * Send a 6-digit OTP verification code to the merchant's email
 */
export async function sendLoginOtpAction(email: string) {
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
      error: "No store found with this email. Please register your store first.",
    };
  }

  const code = generateOtpCode();
  const codeId = `otp_${crypto.randomUUID().slice(0, 10)}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  // Remove existing pending codes for this email
  try {
    await db.prepare("DELETE FROM VerificationCodes WHERE email = ?").bind(cleanEmail).run();
  } catch {}

  // Store new code
  await db
    .prepare(
      `INSERT INTO VerificationCodes (id, email, code, expires_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(codeId, cleanEmail, code, expiresAt)
    .run();

  // Send via Cloudflare Native Email Service
  const html = getLoginOtpEmailHtml({
    code,
    businessName: merchant.business_name,
  });

  await sendEmail({
    to: cleanEmail,
    subject: `Your NEFTrack Login Code: ${code}`,
    html,
  });

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}. Check your inbox or spam folder.`,
  };
}

/**
 * Verify 6-digit OTP and establish session
 */
export async function verifyLoginOtpAction(params: {
  email: string;
  code: string;
}) {
  const cleanEmail = params.email.toLowerCase().trim();
  const cleanCode = params.code.trim();
  const db = getD1Database();
  const now = new Date().toISOString();

  const validRecord = await db
    .prepare(
      "SELECT * FROM VerificationCodes WHERE email = ? AND code = ? AND expires_at > ?"
    )
    .bind(cleanEmail, cleanCode, now)
    .first<any>();

  if (!validRecord) {
    return {
      success: false,
      error: "Invalid or expired 6-digit verification code. Please request a new one.",
    };
  }

  // Delete used code
  await db
    .prepare("DELETE FROM VerificationCodes WHERE email = ?")
    .bind(cleanEmail)
    .run();

  // Fetch merchant
  const merchant = await db
    .prepare("SELECT * FROM Merchants WHERE email = ?")
    .bind(cleanEmail)
    .first<any>();

  if (!merchant) {
    return { success: false, error: "Merchant account not found." };
  }

  await setSessionCookie({
    id: merchant.id,
    email: merchant.email,
    name: merchant.business_name,
    business_name: merchant.business_name,
    phone_number: merchant.phone_number,
    address: merchant.address || null,
  });

  return { success: true };
}

/**
 * Update Merchant Store Profile (Name, Phone, Address)
 */
export async function updateMerchantProfileAction(params: {
  businessName: string;
  phoneNumber: string;
  address?: string;
}) {
  try {
    const merchantId = await requireMerchantId();
    const session = await getSession();
    const cleanBusiness = params.businessName.trim();
    const cleanPhone = params.phoneNumber.trim();
    const cleanAddress = params.address?.trim() || null;

    if (!cleanBusiness || !cleanPhone) {
      return { success: false, error: "Business name and phone number are required." };
    }

    const db = getD1Database();
    await db
      .prepare(
        "UPDATE Merchants SET business_name = ?, phone_number = ?, address = ? WHERE id = ?"
      )
      .bind(cleanBusiness, cleanPhone, cleanAddress, merchantId)
      .run();

    // Re-issue updated session cookie
    if (session) {
      await setSessionCookie({
        ...session,
        name: cleanBusiness,
        business_name: cleanBusiness,
        phone_number: cleanPhone,
        address: cleanAddress,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("updateMerchantProfileAction error:", err);
    return { success: false, error: err.message || "Failed to update store profile." };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
