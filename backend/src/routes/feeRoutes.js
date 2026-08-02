import express from "express";
import { markFeePaid, generateMonthlyFees, getFeeOverview } from "../controllers/feeController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/overview", getFeeOverview);
router.post("/mark-paid", markFeePaid);
router.post("/generate-monthly", generateMonthlyFees);

export default router;
