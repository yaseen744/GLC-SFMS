import express from "express";
import { login, register, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register); // used for creating additional admins (dev)
router.get("/me", protect, getMe);

export default router;
