import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    medicines: [
      {
        name: { type: String, required: true },
        dose: { type: String, required: true }, // e.g. "500mg" or "1 tablet"
        time: { type: String, required: true }, // e.g. "08:00" or "08:00, 20:00"
        duration: { type: String, required: true }, // e.g. "7 days"
      },
    ],
    notes: { type: String }, // Encrypted
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
