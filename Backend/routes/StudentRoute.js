import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createStudent, getStudents, updateStudent, deleteStudent } from "../Controller/StudentController.js";
import { protect } from "../middleware/authMiddleware.js";

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

router.post("/register", protect, upload.single("aadharCard"), createStudent);
router.get("/all", protect, getStudents);
router.put("/:id", protect, upload.single("aadharCard"), updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;
