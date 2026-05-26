import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async(req,res)=>{
    try{
        // 1. Destructure OName (Capital N)
        const { OName, LName, city, seats, email, password } = req.body;

        // 2. Validate OName
        if (OName.trim().length < 3 || LName.trim().length < 3) {
            return res.status(400).json({ message: "Name must be at least 3 characters long" });
        }

        if (seats <= 0) {
            return res.status(400).json({ message: "Seats must be a positive number" });
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Instantiate with OName
        const user = new User({
            OName,
            LName,
            city,
            seats,
            email,
            password: hashedPassword,
        });
        await user.save();
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch(error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
