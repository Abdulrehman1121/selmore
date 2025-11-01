import { Router, RequestHandler } from "express";
import { authGuard, roleGuard } from "../middleware/auth";
import { createCampaign, listCampaigns, getCampaign } from "../controllers/campaignController";

const router = Router();

router.post("/", authGuard, roleGuard(["client"]), createCampaign);
router.get("/", listCampaigns); // Temporarily public for testing
router.get("/:id", getCampaign); // Temporarily public for testing

export default router;