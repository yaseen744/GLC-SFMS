import "dotenv/config";
import crypto from "crypto";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const USERNAME = (process.env.ADMIN_USERNAME || "admin").toLowerCase().trim();
const EMAIL = process.env.ADMIN_EMAIL;

// Generates a strong random password instead of a guessable default like "admin123".
function generateStrongPassword() {
  return crypto.randomBytes(12).toString("base64url"); // ~16 char, high entropy
}

async function main() {
  if (!EMAIL) {
    console.error("❌ ADMIN_EMAIL is required in your .env file (OTP codes are sent here). Add it and re-run.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ username: USERNAME });

  if (existing) {
    // Admin already exists — just keep the email in sync, never touch the password here.
    if (existing.email !== EMAIL.toLowerCase().trim()) {
      existing.email = EMAIL.toLowerCase().trim();
      await existing.save();
      console.log(`✅ Updated email for admin "${USERNAME}" -> ${EMAIL}`);
    } else {
      console.log(`ℹ️  Admin "${USERNAME}" already exists with this email — nothing to do.`);
    }
  } else {
    const password = process.env.ADMIN_PASSWORD || generateStrongPassword();
    await User.create({ username: USERNAME, password, email: EMAIL.toLowerCase().trim(), role: "admin" });
    console.log("✅ Admin account created:");
    console.log(`   username: ${USERNAME}`);
    console.log(`   email:    ${EMAIL}`);
    console.log(`   password: ${password}`);
    console.log("⚠️  Save this password now — it will not be shown again. Store it somewhere safe (password manager).");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
