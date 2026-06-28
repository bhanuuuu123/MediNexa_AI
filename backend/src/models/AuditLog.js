import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userModel", required: true },
    userModel: { type: String, required: true, enum: ["Patient", "Doctor"] },
    action: { type: String, required: true }, // e.g. "ACCESS_HEALTH_RECORD", "UPLOAD_HEALTH_RECORD"
    resource: { type: String, required: true }, // e.g. "Report", "Prescription"
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
