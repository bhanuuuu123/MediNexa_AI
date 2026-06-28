import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadReport, listReports } from "../controllers/reportController.js";
import { reportSchema } from "../utils/validators.js";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../utils/constants.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/reports");
  },
  filename(req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF and images allowed."), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: MAX_FILE_SIZE } 
});

router.post("/upload", protect, upload.single("file"), validate(reportSchema), uploadReport);
router.get("/", protect, listReports);

export default router;
