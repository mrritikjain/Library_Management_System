import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async(req,res)=>{
    try{
        // 1. Destructure fields
        const { OName, LName, city, seats, email, password } = req.body;

        // 2. Validate fields exist and are correct length/type
        if (!OName || typeof OName !== "string" || OName.trim().length < 3) {
            return res.status(400).json({ message: "Owner name must be at least 3 characters long" });
        }

        if (!LName || typeof LName !== "string" || LName.trim().length < 3) {
            return res.status(400).json({ message: "Library name must be at least 3 characters long" });
        }

        if (!city || typeof city !== "string" || city.trim().length === 0) {
            return res.status(400).json({ message: "City is required" });
        }

        const seatCount = Number(seats);
        if (isNaN(seatCount) || seatCount <= 0) {
            return res.status(400).json({ message: "Seats must be a positive number" });
        }

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Instantiate with values
        const user = new User({
            OName: OName.trim(),
            LName: LName.trim(),
            city: city.trim(),
            seats: seatCount,
            email,
            password: hashedPassword,
        });
        await user.save();

        // 4. Generate token to auto-login upon registration
        const token = jwt.sign({userID:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"});

        res.cookie("token", token,{
            httpOnly:true,
            secure:false,
            sameSite:"Lax",
            maxAge:24*60*60*1000
        });

        return res.status(201).json({ 
            message: "User registered successfully", 
            token,
            user: {
                OName: user.OName,
                LName: user.LName,
                email: user.email
            }
        });
    }
    catch(error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const loginUser = async(req, res)=>{
    try{
   const {email, password} = req.body;
   if(!email || !password){
    return res.status(400).json({message:"All Fields are required"});
   }
   const user = await User.findOne({email});
   if(!user){
    return res.status(400).json({message:"User does not exist"});
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if(!isMatch){
    return res.status(400).json({message:"Invalid Password"});
   }
   const token = jwt.sign({userID:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"});
   
   res.cookie("token", token,{
    httpOnly:true,
    secure:false,
    sameSite:"Lax",
    maxAge:24*60*60*1000
   })
   return res.status(200).json({
    message:"User logged in successfully",
    token,
   })
    }
    catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
export const userDetails = async(req,res)=>{
    try {
        const token = req.cookies.token;
        if(!token){
          return  res.status(401).json({message: "token is missing"});
        }
         const decode = jwt.verify(token, process.env.JWT_SECRET);
         const user = await User.findOne({_id:decode.userID});
         if(!user){
          return  res.status(404).json({message :"user not found"})
         }
         res.status(200).json(user);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logoutUser = async(req, res)=>{
    try {
         res.cookie("token", "",{
    httpOnly:true,
    secure:false,
    sameSite:"Lax",
    expires : new Date(0),
   });
   res.status(200).json({message: "Logout successfully."})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

