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
import { protect } from "./middleware/authMiddleware.js";
import { checkSubscription } from "./middleware/subscriptionMiddleware.js";
import SubscriptionRoute from "./routes/SubscriptionRoute.js";

dotenv.config();
const app = express();

// Normalize double slashes in URLs to prevent 404 routing issues
app.use((req, res, next) => {
    req.url = req.url.replace(/\/{2,}/g, "/");
    next();
});

let frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
// Clean up any accidental quotes or trailing slash from environment variables
frontendUrl = frontendUrl.replace(/^['"`]+|['"`]+$/g, "").trim();
if (frontendUrl.endsWith("/")) {
    frontendUrl = frontendUrl.slice(0, -1);
}

app.use(express.json());
app.use(cors(
    {origin: frontendUrl, credentials: true}
));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api", UserRoute);
app.use("/api/subscriptions", SubscriptionRoute);
app.use("/api/seats", protect, checkSubscription, SeatRoute);
app.use("/api/students", protect, checkSubscription, StudentRoute);
app.use("/api/fees", protect, checkSubscription, FeeRoute);
app.use("/api/expenses", protect, checkSubscription, ExpenseRoute);
app.use("/api/dashboard", protect, checkSubscription, DashboardRoute);
app.use("/api/notifications", protect, checkSubscription, NotificationRoute);

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

