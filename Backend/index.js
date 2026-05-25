require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();

mongoose.connect(MONGO_URI).then(() =>{
    console.log("Connected to MongoDB");
}).catch(() =>{
    console.log("Failed to connect to MongoDB");
})

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})
app.get("/", (req,res)=>{
    res.json({
        message: "Hello World",
        data: "Hello World"
    });
})