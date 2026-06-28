import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    date: { type: String, required: true },
    notes: { type: String, trim: true },
    summary: { type: String, default: "AI summary pending." },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
