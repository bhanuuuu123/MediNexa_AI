import express from "express";
import {
  registerPatient,
  registerDoctor,
  loginPatient,
  loginDoctor,
  getProfile,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  patientRegisterSchema,
  doctorRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validators.js";

const router = express.Router();

router.post("/patient/register", validate(patientRegisterSchema), registerPatient);
router.post("/patient/login", validate(loginSchema), loginPatient);
router.post("/doctor/register", validate(doctorRegisterSchema), registerDoctor);
router.post("/doctor/login", validate(loginSchema), loginDoctor);
router.post("/logout", logoutUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/profile", protect, getProfile);

export default router;
