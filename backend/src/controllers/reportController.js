import Report from "../models/Report.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { logAudit } from "../utils/audit.js";

export async function uploadReport(req, res, next) {
  try {
    const { name, doctorId, date, notes } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400);
      return next(new Error("File upload is required."));
    }

    const encryptedNotes = notes ? encrypt(notes) : "";
    const mockAISummary = `Patient submitted ${name}. Critical diagnostic elements are stable. Cardiovascular markers are within normal range. No acute symptoms detected. Follow-up with primary physician as scheduled.`;
    const encryptedSummary = encrypt(mockAISummary);

    const report = await Report.create({
      patient: req.user._id,
      doctor: doctorId || null,
      name,
      fileUrl: file.path.replace(/\\/g, "/"), // Normalise windows file paths
      date,
      notes: encryptedNotes,
      summary: encryptedSummary,
    });

    await logAudit(req, "UPLOAD_HEALTH_RECORD", "Report", report._id);

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
}

export async function listReports(req, res, next) {
  try {
    let filter = {};
    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    } else if (req.user.role === "doctor") {
      const patientId = req.query.patientId;
      if (!patientId) {
        res.status(400);
        return next(new Error("Patient ID is required for doctor access."));
      }
      filter.patient = patientId;
    }

    const reports = await Report.find(filter)
      .populate("doctor", "full_name specialization")
      .populate("patient", "full_name email")
      .sort({ createdAt: -1 });

    const decrypted = reports.map((r) => {
      const doc = r.toObject();
      if (doc.notes) doc.notes = decrypt(doc.notes);
      if (doc.summary) doc.summary = decrypt(doc.summary);
      return doc;
    });

    if (decrypted.length > 0) {
      await logAudit(
        req,
        req.user.role === "doctor" ? "DOCTOR_ACCESS_HEALTH_RECORDS" : "PATIENT_ACCESS_HEALTH_RECORDS",
        "Report",
        decrypted[0]._id
      );
    }

    res.json(decrypted);
  } catch (error) {
    next(error);
  }
}
