import express from "express";
import { getSeats } from "../Controller/seatController.js";

const router = express.Router();

router.get("/all", getSeats);

export default router;