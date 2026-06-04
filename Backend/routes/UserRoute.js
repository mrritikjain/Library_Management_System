import express from "express";
import { registerUser, loginUser, logoutUser, userDetails, updateUserSettings, forgotPassword } from "../Controller/UserController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/userDetails", userDetails);
router.post("/logout", logoutUser);
router.put("/updateSettings", protect, updateUserSettings);
router.post("/forgot-password", forgotPassword);

export default router; 