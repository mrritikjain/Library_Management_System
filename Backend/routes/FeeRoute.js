import express from "express";
import { createFee, getFees, deleteFee } from "../Controller/FeeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record", protect, createFee);
router.get("/all", protect, getFees);
router.delete("/:id", protect, deleteFee);

export default router;
