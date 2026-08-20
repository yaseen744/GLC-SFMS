import express from "express";
import { login, verifyOtp, resendOtp, register, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login); // step 1: username + password -> sends OTP, returns pendingToken
router.post("/verify-otp", verifyOtp); // step 2: pendingToken + otp -> real access token
router.post("/resend-otp", resendOtp); // resend a fresh code for the current pending session
router.post("/register", register); // used for creating additional admins (dev)
router.get("/me", protect, getMe);

export default router;
