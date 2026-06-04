import express from "express";
import { createExpense, getExpenses, deleteExpense } from "../Controller/ExpenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record", protect, createExpense);
router.get("/all", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);

export default router;
