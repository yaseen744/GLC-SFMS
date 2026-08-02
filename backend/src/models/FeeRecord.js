import mongoose from "mongoose";

const feeRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    feeAmount: { type: Number, required: true },
    status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" },
    paymentDate: { type: Date },
  },
  { timestamps: true },
);

feeRecordSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

export const FeeRecord = mongoose.model("FeeRecord", feeRecordSchema);
