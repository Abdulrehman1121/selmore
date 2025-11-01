import { Router } from "express";
import { authGuard } from "../middleware/auth";
import { downloadInvoice, listInvoices, markPaid } from "../controllers/invoiceController";
import { AuthRequest } from "../controllers/invoiceController";
const router = Router();
router.get("/", authGuard, listInvoices);
router.get("/:id/download", authGuard, downloadInvoice);
router.post("/:id/pay", authGuard, markPaid);
export default router;
