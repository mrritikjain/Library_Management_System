import dotenv from "dotenv";
import express from "express";
import connectDB from "./Config/db.js";
import UserRoute from "./routes/UserRoute.js";
import SeatRoute from "./routes/seatRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import FeeRoute from "./routes/FeeRoute.js";
import ExpenseRoute from "./routes/ExpenseRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import NotificationRoute from "./routes/NotificationRoute.js";
import { runNotificationCron } from "./utils/notificationSystem.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors(
    {origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true}
));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api", UserRoute);
app.use("/api/seats", SeatRoute);
app.use("/api/students", StudentRoute);
app.use("/api/fees", FeeRoute);
app.use("/api/expenses", ExpenseRoute);
app.use("/api/dashboard", DashboardRoute);
app.use("/api/notifications", NotificationRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () =>{
    console.log(`Server is running on port ${PORT}`);
     await connectDB();
     
     // Start notifications background checker
     setTimeout(() => {
         runNotificationCron().catch(err => console.error("Error in startup notification cron:", err));
     }, 3000);
     
     setInterval(() => {
         runNotificationCron().catch(err => console.error("Error in interval notification cron:", err));
     }, 60 * 60 * 1000); // check every hour
})

