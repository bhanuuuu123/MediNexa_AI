import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export async function createAppointment(req, res, next) {
  try {
    const { doctorId, date, slot, reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404);
      return next(new Error("Doctor not found."));
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      date,
      slot,
      reason,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
}

export async function listAppointments(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === "patient") filter.patient = req.user._id;
    if (req.user.role === "doctor") filter.doctor = req.user._id;

    const appointments = await Appointment.find(filter)
      .populate("doctor", "full_name specialization rating")
      .populate("patient", "full_name email")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404);
      return next(new Error("Appointment not found."));
    }

    if (req.user.role === "patient" && appointment.patient.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Cannot modify this appointment."));
    }

    if (req.user.role === "doctor" && appointment.doctor.toString() !== req.user._id.toString()) {
      res.status(403);
      return next(new Error("Cannot modify this appointment."));
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    next(error);
  }
}
