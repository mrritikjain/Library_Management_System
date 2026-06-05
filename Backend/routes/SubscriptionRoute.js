import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitSubscriptionRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
} from "../Controller/SubscriptionController.js";

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
const router = express.Router();

router.post("/submit", protect, upload.single("screenshot"), submitSubscriptionRequest);
router.get("/pending", protect, getPendingRequests);
router.post("/approve/:id", protect, approveRequest);
router.post("/reject/:id", protect, rejectRequest);

export default router;
