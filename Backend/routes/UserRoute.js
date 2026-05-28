import express from "express";
import { registerUser,loginUser, logoutUser, userDetails } from "../Controller/UserController.js";
const router = express.Router();
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/userDetails", userDetails);
router.post("/logout",logoutUser);
export default router; 