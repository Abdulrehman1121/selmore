import { Router } from "express";
import { authGuard, roleGuard } from "../middleware/auth";
import { placeBid, listBidsForBillboard, ownerRespondBid } from "../controllers/bidController";

const router = Router();
router.post("/", authGuard, roleGuard(["client"]), placeBid);
router.get("/billboard/:id", authGuard, listBidsForBillboard);
router.post("/:id/respond", authGuard, roleGuard(["owner"]), ownerRespondBid);

export default router;
