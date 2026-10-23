import crypto from "crypto";

/**
 * Hash a plain-text password using PBKDF2 with SHA-512 and random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain-text password against a stored salt:hash string
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(testHash, "hex"), Buffer.from(originalHash, "hex"));
}

/**
 * Generate a random 6-digit numeric OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
