import express from "express";
import authRoutes from "./auth.js";
import doctorRoutes from "./doctors.js";
import appointmentRoutes from "./appointments.js";
import medicineRoutes from "./medicines.js";
import reportRoutes from "./reports.js";
import chatRoutes from "./chat.js";
import prescriptionRoutes from "./prescriptions.js";
import emergencyRoutes from "./emergency.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/medicines", medicineRoutes);
router.use("/reports", reportRoutes);
router.use("/chat", chatRoutes);
router.use("/prescriptions", prescriptionRoutes);
router.use("/emergency", emergencyRoutes);

export default router;
