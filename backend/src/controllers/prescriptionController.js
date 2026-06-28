import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { logAudit } from "../utils/audit.js";

export async function createPrescription(req, res, next) {
  try {
    const { patientId, date, medicines, notes } = req.body;

    if (req.user.role !== "doctor") {
      res.status(403);
      return next(new Error("Only doctors can issue prescriptions."));
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      res.status(404);
      return next(new Error("Patient not found."));
    }

    const encryptedNotes = notes ? encrypt(notes) : "";

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: req.user._id,
      date,
      medicines,
      notes: encryptedNotes,
    });

    await logAudit(req, "CREATE_PRESCRIPTION", "Prescription", prescription._id);

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
}

export async function listPrescriptions(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === "patient") filter.patient = req.user._id;
    if (req.user.role === "doctor") filter.doctor = req.user._id;

    const prescriptions = await Prescription.find(filter)
      .populate("doctor", "full_name specialization")
      .populate("patient", "full_name email")
      .sort({ createdAt: -1 });

    // Decrypt notes for output and log access
    const decrypted = prescriptions.map((p) => {
      const doc = p.toObject();
      if (doc.notes) {
        doc.notes = decrypt(doc.notes);
      }
      return doc;
    });

    if (decrypted.length > 0) {
      await logAudit(req, "LIST_PRESCRIPTIONS", "Prescription");
    }

    res.json(decrypted);
  } catch (error) {
    next(error);
  }
}
