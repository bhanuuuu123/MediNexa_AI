import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorProfile,
  addAvailability,
  blockDate,
  listAssignedPatients,
} from "../controllers/doctorController.js";
import { addAvailabilitySchema, blockDateSchema } from "../utils/validators.js";

const router = express.Router();

router.get("/", listDoctors);
router.get("/availability", getDoctorAvailability);
router.get("/patients", protect, authorize("doctor"), listAssignedPatients);
router.get("/:id", getDoctorById);

router.put("/profile", protect, authorize("doctor"), updateDoctorProfile);
router.post("/availability", protect, authorize("doctor"), validate(addAvailabilitySchema), addAvailability);
router.post("/block-date", protect, authorize("doctor"), validate(blockDateSchema), blockDate);

export default router;
