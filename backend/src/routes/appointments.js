import express from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createAppointment, listAppointments, updateAppointmentStatus } from "../controllers/appointmentController.js";
import { appointmentSchema, updateAppointmentStatusSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/", protect, validate(appointmentSchema), createAppointment);
router.get("/", protect, listAppointments);
router.put("/:id", protect, validate(updateAppointmentStatusSchema), updateAppointmentStatus);

export default router;
