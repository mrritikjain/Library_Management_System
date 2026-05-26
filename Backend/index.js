import dotenv from "dotenv";
import express from "express";
import connectDB from "./Config/db.js";
import UserRoute from "./routes/UserRoute.js";
import cors from "cors";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api",UserRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () =>{
    console.log(`Server is running on port ${PORT}`);
     await connectDB();
})
