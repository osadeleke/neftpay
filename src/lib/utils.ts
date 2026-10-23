import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats monetary amounts from Kobo integers to Nigerian Naira (₦).
 * All DB values are stored as integers in Kobo (1 Naira = 100 Kobo).
 * Example: 5000000 Kobo -> ₦50,000
 */
export function formatNaira(
  kobo: number | null | undefined,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
  }
): string {
  if (kobo === null || kobo === undefined || isNaN(kobo)) {
    return "₦0";
  }

  const naira = kobo / 100;

  if (options?.compact && Math.abs(naira) >= 1_000_000) {
    return `₦${(naira / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (options?.compact && Math.abs(naira) >= 100_000) {
    return `₦${(naira / 1_000).toFixed(0)}k`;
  }

  const hasDecimals = options?.showDecimals || kobo % 100 !== 0;

  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(naira);

  return `₦${formatted}`;
}

/**
 * Converts Kobo (integer) to Naira (float/number).
 */
export function koboToNaira(kobo: number): number {
  return (kobo || 0) / 100;
}

/**
 * Converts Naira input to Kobo integer.
 * Handles strings with commas or symbols like "₦50,000" -> 5000000
 */
export function nairaToKobo(naira: number | string): number {
  if (typeof naira === "number") {
    return Math.round(naira * 100);
  }
  const clean = naira.replace(/[^\d.]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Generates an 8-character alphanumeric slug for magic links (e.g. "x8k2m9p4")
 */
export function generateMagicSlug(length = 8): string {
  const chars = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

/**
 * Cleans and converts Nigerian phone numbers to international WhatsApp format (234...)
 * E.g., '08031234567' -> '2348031234567'
 *       '+234 803 123 4567' -> '2348031234567'
 */
export function formatNigerianPhoneForWhatsApp(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, "");
  if (clean.startsWith("+234")) {
    return clean.slice(1);
  }
  if (clean.startsWith("234")) {
    return clean;
  }
  if (clean.startsWith("0")) {
    return `234${clean.slice(1)}`;
  }
  return clean;
}

/**
 * Builds a direct WhatsApp click-to-chat URL with pre-filled message
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatNigerianPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

/**
 * Formats a date string into readable Nigerian format
 */
export function formatFriendlyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatFriendlyDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
