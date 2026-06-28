import bcrypt from "bcryptjs";
import crypto from "crypto";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import { signToken } from "../utils/jwt.js";

// Helper to set httpOnly cookie
function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax allows cookie to be sent during cross-site navigation
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export async function registerPatient(req, res, next) {
  try {
    const { full_name, email, password, age, gender, phone } = req.body;

    const existingPatient = await Patient.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    if (existingPatient || existingDoctor) {
      res.status(409);
      return next(new Error("Email is already registered."));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const patient = await Patient.create({
      full_name,
      email,
      password: hashedPassword,
      age,
      gender,
      phone,
    });

    const token = signToken({ id: patient._id, role: "patient" });
    setAuthCookie(res, token);

    res.status(201).json({
      user: {
        id: patient._id,
        patient_id: patient.patient_id,
        full_name: patient.full_name,
        email: patient.email,
        role: "patient",
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function registerDoctor(req, res, next) {
  try {
    const { full_name, email, password, specialization, experience, license_number } = req.body;

    const existingPatient = await Patient.findOne({ email });
    const existingDoctor = await Doctor.findOne({ email });
    if (existingPatient || existingDoctor) {
      res.status(409);
      return next(new Error("Email is already registered."));
    }

    const existingLicense = await Doctor.findOne({ license_number });
    if (existingLicense) {
      res.status(409);
      return next(new Error("Medical license number is already registered."));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const doctor = await Doctor.create({
      full_name,
      email,
      password: hashedPassword,
      specialization,
      experience,
      license_number,
    });

    const token = signToken({ id: doctor._id, role: "doctor" });
    setAuthCookie(res, token);

    res.status(201).json({
      user: {
        id: doctor._id,
        doctor_id: doctor.doctor_id,
        full_name: doctor.full_name,
        email: doctor.email,
        role: "doctor",
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginPatient(req, res, next) {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient || !(await bcrypt.compare(password, patient.password))) {
      res.status(401);
      return next(new Error("Invalid credentials."));
    }

    const token = signToken({ id: patient._id, role: "patient" });
    setAuthCookie(res, token);

    res.json({
      user: {
        id: patient._id,
        patient_id: patient.patient_id,
        full_name: patient.full_name,
        email: patient.email,
        role: "patient",
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginDoctor(req, res, next) {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      res.status(401);
      return next(new Error("Invalid credentials."));
    }

    const token = signToken({ id: doctor._id, role: "doctor" });
    setAuthCookie(res, token);

    res.json({
      user: {
        id: doctor._id,
        doctor_id: doctor.doctor_id,
        full_name: doctor.full_name,
        email: doctor.email,
        role: "doctor",
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutUser(req, res, next) {
  try {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    let user = await Patient.findOne({ email });
    let isPatient = true;

    if (!user) {
      user = await Doctor.findOne({ email });
      isPatient = false;
    }
    
    if (!user) {
      res.status(404);
      return next(new Error("No user registered with that email address."));
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(`\n=== PASSWORD RESET LINK FOR ${email} ===\n${resetUrl}\n======================================\n`);

    res.json({
      message: "Reset link generated successfully. Please check server logs.",
      token: resetToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    let user = await Patient.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      user = await Doctor.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      res.status(400);
      return next(new Error("Invalid or expired password reset token."));
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
}
