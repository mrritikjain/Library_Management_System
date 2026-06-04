import dotenv from "dotenv";
import express from "express";
import connectDB from "./Config/db.js";
import UserRoute from "./routes/UserRoute.js";
import SeatRoute from "./routes/seatRoute.js";
import StudentRoute from "./routes/StudentRoute.js";
import FeeRoute from "./routes/FeeRoute.js";
import ExpenseRoute from "./routes/ExpenseRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors(
    {origin: "http://localhost:5173", credentials: true}
));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use("/api", UserRoute);
app.use("/api/seats", SeatRoute);
app.use("/api/students", StudentRoute);
app.use("/api/fees", FeeRoute);
app.use("/api/expenses", ExpenseRoute);
app.use("/api/dashboard", DashboardRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () =>{
    console.log(`Server is running on port ${PORT}`);
     await connectDB();
})
