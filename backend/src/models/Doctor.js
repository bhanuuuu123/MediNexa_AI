import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: String,
      unique: true,
      default: () => "DOC-" + Math.floor(100000 + Math.random() * 900000),
    },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, required: true, default: 0 },
    license_number: { type: String, required: true, unique: true, trim: true },
    rating: { type: Number, default: 4.8 },
    bio: { type: String, trim: true, default: "Experienced healthcare professional." },
    availableSlots: [{ date: String, slots: [String] }],
    blockedDates: [{ type: String }],
    
    // Recovery token
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
