import dotenv from "dotenv";
import express from "express";
import connectDB from "./Config/db.js";
import UserRoute from "./routes/UserRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors(
    {origin: "http://localhost:5173", credentials: true}
));
app.use(cookieParser());
app.use("/api",UserRoute);
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () =>{
    console.log(`Server is running on port ${PORT}`);
     await connectDB();
})
