import express from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { addMedicine, listMedicines, updateMedicineStatus } from "../controllers/medicineController.js";
import { medicineSchema, updateMedicineStatusSchema } from "../utils/validators.js";

const router = express.Router();

router.post("/", protect, validate(medicineSchema), addMedicine);
router.get("/", protect, listMedicines);
router.put("/status/:id", protect, validate(updateMedicineStatusSchema), updateMedicineStatus);

export default router;
