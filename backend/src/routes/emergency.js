import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getEmergencyProfile,
  updateEmergencyProfile,
  requestAmbulance,
  listNearbyHospitals,
} from "../controllers/emergencyController.js";

const router = express.Router();

router.get("/hospitals", listNearbyHospitals);
router.post("/ambulance", requestAmbulance);
router.get("/profile", protect, getEmergencyProfile);
router.put("/profile", protect, updateEmergencyProfile);

export default router;
