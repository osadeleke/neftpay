import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getD1Database } from "../db/d1-client";
import { DEMO_MERCHANT_ID } from "../db/seed";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "neftrack-super-secret-jwt-key-sme-nigeria-2026-very-secure",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // 1. Google OAuth Provider
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // 3. Passwordless Merchant Magic Link / Quick-Sign-in Provider
    CredentialsProvider({
      id: "magic-link",
      name: "Magic Email Link",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "merchant@business.ng" },
        business_name: { label: "Business Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const db = getD1Database();
        const email = credentials.email.toLowerCase().trim();

        // Check if merchant exists
        let merchant = await db
          .prepare("SELECT * FROM Merchants WHERE email = ?")
          .bind(email)
          .first<any>();

        if (!merchant) {
          // Auto-provision merchant for magic link flow
          const id = `mer_${crypto.randomUUID().slice(0, 12)}`;
          const bName = credentials.business_name?.trim() || `${email.split("@")[0]}'s Enterprise`;
          await db
            .prepare(
              `INSERT INTO Merchants (id, business_name, phone_number, email, subscription_tier)
               VALUES (?, ?, ?, ?, 'free')`
            )
            .bind(id, bName, "08012345678", email)
            .run();

          merchant = {
            id,
            business_name: bName,
            phone_number: "08012345678",
            email,
          };
        }

        return {
          id: merchant.id,
          email: merchant.email,
          name: merchant.business_name,
          business_name: merchant.business_name,
          phone_number: merchant.phone_number,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.business_name = (user as any).business_name || user.name;
        token.phone_number = (user as any).phone_number || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id || DEMO_MERCHANT_ID;
        (session.user as any).business_name = token.business_name || "Adebayo Electronics & Solar";
        (session.user as any).phone_number = token.phone_number || "08035552341";
      }
      return session;
    },
  },
};
