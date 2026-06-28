import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    name: { type: String, required: true, trim: true },
    dose: { type: String, required: true },
    time: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Taken", "Missed"], default: "Pending" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
