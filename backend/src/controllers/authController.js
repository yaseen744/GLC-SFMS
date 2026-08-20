import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { generateToken, generatePendingToken } from "../utils/generateToken.js";
import { generateOtp, hashOtp, compareOtp, maskEmail } from "../utils/otp.js";
import { sendOtpEmail } from "../utils/mailer.js";

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || 5);
const OTP_RESEND_COOLDOWN_SECONDS = 45;
const MAX_OTP_ATTEMPTS = 5;

// --------------------------------------------------------------------------
// STEP 1: verify username + password. If correct, generate an OTP, email it,
// and hand back a short-lived "pending" token (NOT a login session).
// --------------------------------------------------------------------------
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!user.email) {
      return res.status(400).json({
        message:
          "This admin account has no email on file, so a verification code can't be sent. Run the seed script with ADMIN_EMAIL set to fix this.",
      });
    }

    const otp = generateOtp();
    user.otpHash = await hashOtp(otp);
    user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr.message);
      return res.status(500).json({ message: "Couldn't send the verification code. Please try again shortly." });
    }

    return res.json({
      message: "Verification code sent",
      pendingToken: generatePendingToken(user._id),
      maskedEmail: maskEmail(user.email),
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// --------------------------------------------------------------------------
// STEP 2: verify the OTP against the pending token. On success, issue the
// real access token (this is the moment the user is actually "logged in").
// --------------------------------------------------------------------------
export async function verifyOtp(req, res) {
  try {
    const { pendingToken, otp } = req.body;
    if (!pendingToken || !otp) {
      return res.status(400).json({ message: "Missing verification code" });
    }

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Your session expired. Please sign in again." });
    }
    if (decoded.type !== "otp_pending") {
      return res.status(401).json({ message: "Invalid verification session." });
    }

    const user = await User.findById(decoded.id).select("+otpHash +otpExpires +otpAttempts");
    if (!user || !user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: "No active verification code. Please sign in again." });
    }

    if (Date.now() > new Date(user.otpExpires).getTime()) {
      user.otpHash = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "Code expired. Please request a new one." });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.otpHash = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ message: "Too many incorrect attempts. Please sign in again." });
    }

    const isValid = await compareOtp(otp, user.otpHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return res.status(400).json({ message: `Incorrect code. ${remaining} attempt(s) left.` });
    }

    // Success — clear the OTP so it can never be reused, then issue the real token.
    user.otpHash = null;
    user.otpExpires = null;
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// --------------------------------------------------------------------------
// Resend a fresh OTP using the same pending token (rate-limited).
// --------------------------------------------------------------------------
export async function resendOtp(req, res) {
  try {
    const { pendingToken } = req.body;
    if (!pendingToken) {
      return res.status(400).json({ message: "Missing verification session" });
    }

    let decoded;
    try {
      decoded = jwt.verify(pendingToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Your session expired. Please sign in again." });
    }
    if (decoded.type !== "otp_pending") {
      return res.status(401).json({ message: "Invalid verification session." });
    }

    const user = await User.findById(decoded.id).select("+lastOtpSentAt");
    if (!user) {
      return res.status(400).json({ message: "Please sign in again." });
    }

    if (user.lastOtpSentAt) {
      const secondsSinceLast = (Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000;
      if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another code.`,
        });
      }
    }

    const otp = generateOtp();
    user.otpHash = await hashOtp(otp);
    user.otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpAttempts = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res.json({ message: "A new code has been sent", expiresInSeconds: OTP_EXPIRY_MINUTES * 60 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function register(req, res) {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const user = await User.create({ username: username.toLowerCase().trim(), password, email: email.toLowerCase().trim() });
    res.status(201).json({
      message: "Admin created. They can now sign in with their password and email OTP.",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}
