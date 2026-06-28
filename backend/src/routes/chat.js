import express from "express";
import { sendChatMessage, analyzeClinicalConversation } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/message", sendChatMessage);
router.post("/analyze", protect, analyzeClinicalConversation);

export default router;
