import mongoose from "mongoose";
import { Counter } from "./Counter.js";

const studentSchema = new mongoose.Schema(
  {
    studentCode: { type: String, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    parentWhatsapp: { type: String, required: true },
    contactNumber: { type: String },
    class: { type: String, required: true },
    section: { type: String },
    address: { type: String },
    monthlyFee: { type: Number, required: true, default: 0 },
    admissionDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

// Auto-generate a student code like STU-1001, STU-1002, ...
studentSchema.pre("save", async function (next) {
  if (this.studentCode) return next();
  const counter = await Counter.findOneAndUpdate(
    { name: "student_code" },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  this.studentCode = `STU-${1000 + counter.value}`;
  next();
});

export const Student = mongoose.model("Student", studentSchema);
