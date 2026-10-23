import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SessionUser } from "@/types";
import { DEMO_MERCHANT_ID } from "../db/seed";

const SESSION_COOKIE_NAME = "neft_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "neftrack-super-secret-jwt-key-sme-nigeria-2026-very-secure"
);

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    business_name: user.business_name,
    phone_number: user.phone_number,
    address: user.address || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || (payload.business_name as string),
      business_name: payload.business_name as string,
      phone_number: payload.phone_number as string,
      address: (payload.address as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated merchant session from HTTP-only cookies.
 * Returns null if the user is not authenticated.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const verified = await verifySessionToken(token);
    if (verified) return verified;
  }

  return null;
}

/**
 * Extracts and strictly enforces merchant_id from the session.
 * Never trust client input for merchant ownership.
 */
export async function requireMerchantId(): Promise<string> {
  const session = await getSession();
  if (!session || !session.id) {
    throw new Error("Unauthorized: Merchant session required.");
  }
  return session.id;
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
