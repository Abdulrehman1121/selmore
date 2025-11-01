import { Router } from "express";
import { authGuard } from "../middleware/auth";
import { sendMessage, inbox } from "../controllers/messageController";
const router = Router();
router.post("/", authGuard, sendMessage);
router.get("/inbox", authGuard, inbox);
export default router;
