import mongoose from "mongoose";

let connectionPromise;

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sms_db";

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then(() => {
      console.log("✅ MongoDB connected:", mongoose.connection.name);
    });
  }

  try {
    await connectionPromise;
  } catch (err) {
    connectionPromise = undefined;
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  }
}
