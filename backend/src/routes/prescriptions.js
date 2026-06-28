import express from "express";
import { protect } from "../middleware/auth.js";
import { createPrescription, listPrescriptions } from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", protect, createPrescription);
router.get("/", protect, listPrescriptions);

export default router;
