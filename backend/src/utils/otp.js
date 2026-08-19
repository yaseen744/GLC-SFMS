import crypto from "crypto";
import bcrypt from "bcryptjs";

/** Generates a cryptographically random 6-digit OTP as a string, e.g. "042917" */
export function generateOtp() {
  const num = crypto.randomInt(0, 1_000_000); // 0 - 999999
  return num.toString().padStart(6, "0");
}

/** Hashes an OTP before storing it (never store the raw OTP in the DB) */
export async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

/** Compares a raw OTP against its stored hash */
export async function compareOtp(otp, hash) {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}

/** Masks an email for display, e.g. "john.doe@gmail.com" -> "jo******e@gmail.com" */
export function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0] || ""}*@${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 3, 1))}${local.slice(-1)}@${domain}`;
}
