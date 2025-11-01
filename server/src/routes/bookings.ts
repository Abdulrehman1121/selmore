import { Router } from "express";
import { authGuard, roleGuard } from "../middleware/auth";
import { listBookings, createBooking, addBookingAndInvoiceEndpoint } from "../controllers/bookingController";
const router = Router();
router.get("/", authGuard, listBookings);
router.post("/", authGuard, roleGuard(["owner","client"]), createBooking); // optional direct booking
router.post("/:bidId/confirm", authGuard, roleGuard(["owner"]), addBookingAndInvoiceEndpoint); // used when owner accepts bid
export default router;
