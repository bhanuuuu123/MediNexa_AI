import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String,
      unique: true,
      default: () => "PAT-" + Math.floor(100000 + Math.random() * 900000),
    },
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Emergency profile fields embedded for convenience
    bloodGroup: { type: String, default: "O+" },
    allergies: { type: [String], default: [] },
    medicalConditions: { type: [String], default: [] },
    emergencyContactName: { type: String, default: "N/A" },
    emergencyContactPhone: { type: String, default: "N/A" },
    
    // Recovery token
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
