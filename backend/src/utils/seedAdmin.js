import "dotenv/config";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

const USERNAME = process.env.ADMIN_USERNAME || "admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function main() {
  await connectDB();

  const existing = await User.findOne({ username: USERNAME });
  if (existing) {
    console.log(`ℹ️  Admin "${USERNAME}" already exists — nothing to do.`);
  } else {
    await User.create({ username: USERNAME, password: PASSWORD, role: "admin" });
    console.log(`✅ Admin account created: ${USERNAME} / ${PASSWORD}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
