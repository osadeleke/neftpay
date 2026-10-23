"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminPlatformMetrics } from "@/lib/db/queries";

const ADMIN_COOKIE_NAME = "neft_admin_auth";
const DEFAULT_ADMIN_PASSCODE = process.env.ADMIN_SECRET_KEY || "neftrack2026admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token === DEFAULT_ADMIN_PASSCODE;
}

export async function loginAdminAction(passcode: string) {
  if (passcode.trim() === DEFAULT_ADMIN_PASSCODE) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, DEFAULT_ADMIN_PASSCODE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return { success: true };
  }
  return { success: false, error: "Invalid Admin Passcode." };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function getAdminMetricsAction() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return { success: false, error: "Unauthorized admin access." };
  }
  const metrics = await getAdminPlatformMetrics();
  return { success: true, metrics };
}
