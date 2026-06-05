import express from "express";
import MessageLog from "../models/MessageLog.js";
import { runNotificationCron } from "../utils/notificationSystem.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get notification logs for the logged-in librarian's students
router.get("/logs", protect, async (req, res) => {
  try {
    const logs = await MessageLog.find({ createdBy: req.userID })
      .populate("studentId", "name mobile plan")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("Error in GET /logs:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Manually trigger the notification check cron
router.post("/trigger", protect, async (req, res) => {
  try {
    const results = await runNotificationCron();
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error in POST /trigger:", error);
    res.status(500).json({ message: "Failed to trigger notifications check" });
  }
});

export default router;
