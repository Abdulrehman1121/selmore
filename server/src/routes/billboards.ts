import { Router } from "express";
import { authGuard, roleGuard } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { createBillboard, listBillboards, getBillboard, updateBillboard, deleteBillboard } from '../controllers/billboardController';

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "..", UPLOAD_DIR));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

const router = Router();
router.get("/", listBillboards); // public
router.get("/:id", getBillboard);
router.post("/", authGuard, roleGuard(["owner"]), upload.single("image"), createBillboard);
router.put("/:id", authGuard, roleGuard(["owner"]), upload.single("image"), updateBillboard);
router.delete("/:id", authGuard, roleGuard(["owner"]), deleteBillboard);

export default router;
