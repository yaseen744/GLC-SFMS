import { Student } from "../models/Student.js";
import { FeeRecord } from "../models/FeeRecord.js";

export async function markFeePaid(req, res) {
  try {
    const { studentId, month, year } = req.body;
    if (!studentId || !month || !year) {
      return res.status(400).json({ message: "studentId, month and year are required" });
    }

    let record = await FeeRecord.findOne({ student: studentId, month, year });

    if (record) {
      if (record.status === "paid") {
        return res.status(409).json({ message: "Already paid for this month" });
      }
      record.status = "paid";
      record.paymentDate = new Date();
      await record.save();
      return res.json({ ok: true, record });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    record = await FeeRecord.create({
      student: studentId,
      month,
      year,
      feeAmount: student.monthlyFee,
      status: "paid",
      paymentDate: new Date(),
    });
    res.json({ ok: true, record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function generateMonthlyFees(req, res) {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const activeStudents = await Student.find({ status: "active" });
    let inserted = 0;

    for (const student of activeStudents) {
      const exists = await FeeRecord.findOne({ student: student._id, month, year });
      if (exists) continue;
      await FeeRecord.create({
        student: student._id,
        month,
        year,
        feeAmount: student.monthlyFee,
        status: "unpaid",
      });
      inserted++;
    }

    res.json({ inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Fee System overview — every student (across all classes) with their paid/unpaid
// status for a given month/year in one place, so staff can search 400-500 students
// and immediately see + act on who still owes fees.
export async function getFeeOverview(req, res) {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const students = await Student.find({}).sort({ name: 1 }).lean();
    const records = await FeeRecord.find({ month, year }).lean();
    const recordMap = new Map(records.map((r) => [String(r.student), r]));

    const rows = students.map((s) => {
      const rec = recordMap.get(String(s._id));
      return {
        _id: s._id,
        studentCode: s.studentCode,
        name: s.name,
        fatherName: s.fatherName,
        class: s.class,
        parentWhatsapp: s.parentWhatsapp,
        monthlyFee: s.monthlyFee,
        status: s.status,
        feeStatus: rec ? rec.status : "unpaid",
        feeAmount: rec ? rec.feeAmount : s.monthlyFee,
        paymentDate: rec ? rec.paymentDate : null,
      };
    });

    res.json({ month, year, rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
