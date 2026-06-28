import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import { decrypt } from "../utils/crypto.js";

export async function listDoctors(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const specialty = (req.query.specialty || req.query.specialization)?.trim();

    let query = {};
    if (specialty) {
      query.specialization = { $regex: new RegExp(specialty, "i") };
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .select("full_name email specialization experience rating bio license_number doctor_id availableSlots blockedDates")
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, experience: -1 });

    res.json({
      data: doctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDoctorById(req, res, next) {
  try {
    const doctor = await Doctor.findById(req.params.id).select("full_name email specialization experience rating bio availableSlots blockedDates license_number doctor_id");
    if (!doctor) {
      res.status(404);
      return next(new Error("Doctor not found."));
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
}

export async function getDoctorAvailability(req, res, next) {
  try {
    const doctorId = req.query.doctorId?.trim();
    if (!doctorId) {
      res.status(400);
      return next(new Error("Doctor ID is required."));
    }

    const doctor = await Doctor.findById(doctorId).select("availableSlots blockedDates");
    if (!doctor) {
      res.status(404);
      return next(new Error("Doctor availability not found."));
    }
    res.json({ availableSlots: doctor.availableSlots, blockedDates: doctor.blockedDates });
  } catch (error) {
    next(error);
  }
}

export async function updateDoctorProfile(req, res, next) {
  try {
    const updates = ["full_name", "specialization", "experience", "bio", "rating"].reduce((acc, field) => {
      if (req.body[field] !== undefined) acc[field] = req.body[field];
      return acc;
    }, {});

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select("full_name email specialization experience rating bio availableSlots blockedDates license_number doctor_id");
    res.json(doctor);
  } catch (error) {
    next(error);
  }
}

export async function addAvailability(req, res, next) {
  try {
    const { date, slots } = req.body;

    if (req.user.role !== "doctor") {
      res.status(403);
      return next(new Error("Only doctors can modify availability."));
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user._id,
      { $push: { availableSlots: { date, slots } } },
      { new: true }
    );

    res.status(201).json(doctor.availableSlots);
  } catch (error) {
    next(error);
  }
}

export async function blockDate(req, res, next) {
  try {
    const { date } = req.body;

    if (req.user.role !== "doctor") {
      res.status(403);
      return next(new Error("Only doctors can block dates."));
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.user._id,
      { $push: { blockedDates: date } },
      { new: true }
    );

    res.status(201).json({ blockedDates: doctor.blockedDates });
  } catch (error) {
    next(error);
  }
}

export async function listAssignedPatients(req, res, next) {
  try {
    if (req.user.role !== "doctor") {
      res.status(403);
      return next(new Error("Only doctors can access assigned patients."));
    }

    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "full_name email age gender phone bloodGroup allergies medicalConditions emergencyContactName emergencyContactPhone patient_id");

    // Consolidate unique patients
    const patientMap = {};
    appointments.forEach((appt) => {
      if (appt.patient) {
        patientMap[appt.patient._id.toString()] = appt.patient;
      }
    });

    const patients = Object.values(patientMap).map((patientDoc) => {
      return patientDoc.toObject();
    });

    res.json(patients);
  } catch (error) {
    next(error);
  }
}
