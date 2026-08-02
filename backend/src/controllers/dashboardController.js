import { Student } from "../models/Student.js";
import { FeeRecord } from "../models/FeeRecord.js";

export async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const students = await Student.find().select("status monthlyFee");
    const total = students.length;
    const active = students.filter((s) => s.status === "active").length;
    const expected = students
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

    const currentFees = await FeeRecord.find({ month, year });
    const paidStudentIds = new Set(
      currentFees.filter((f) => f.status === "paid").map((f) => String(f.student)),
    );
    const collected = currentFees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + Number(f.feeAmount || 0), 0);

    // 6-month trend
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month - 1 - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const monthFees = await FeeRecord.find({ year: y, month: m });
      const monthCollected = monthFees
        .filter((f) => f.status === "paid")
        .reduce((s, f) => s + Number(f.feeAmount || 0), 0);
      const monthExpected = monthFees.reduce((s, f) => s + Number(f.feeAmount || 0), 0);
      trend.push({
        label: d.toLocaleString("en", { month: "short" }),
        expected: monthExpected,
        collected: monthCollected,
      });
    }

    res.json({
      totalStudents: total,
      activeStudents: active,
      paidStudents: paidStudentIds.size,
      unpaidStudents: active - paidStudentIds.size,
      expectedRevenue: expected,
      collectedRevenue: collected,
      remainingRevenue: Math.max(expected - collected, 0),
      trend,
      currentMonth: month,
      currentYear: year,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
