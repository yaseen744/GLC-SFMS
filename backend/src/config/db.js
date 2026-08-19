import mongoose from "mongoose";

// On Vercel, each serverless invocation can reuse a "warm" instance of this
// module — so we cache the connection promise instead of reconnecting (and
// instead of exiting the process, which would crash the whole function).
let cachedPromise = null;

export async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sms_db";

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((m) => {
        console.log("✅ MongoDB connected:", m.connection.name);
        return m.connection;
      })
      .catch((err) => {
        cachedPromise = null; // allow retry on the next request
        console.error("❌ MongoDB connection failed:", err.message);
        throw err;
      });
  }

  return cachedPromise;
}
