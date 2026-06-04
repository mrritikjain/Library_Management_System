import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { OName, LName, city, seats, email, password } = req.body;

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            OName: OName.trim(),
            LName: LName.trim(),
            city: city.trim(),
            seats: seatCount,
            email,
            password: hashedPassword,
        });
        await user.save();

        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All Fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "User logged in successfully",
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const userDetails = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "token is missing" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decode.userID });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            expires: new Date(0),
        });
        res.status(200).json({ message: "Logout successfully." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateUserSettings = async (req, res) => {
    try {
        const userID = req.userID;
        const { OName, LName, city, seats: newSeatsCount, password } = req.body;

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (OName && (typeof OName !== "string" || OName.trim().length < 3)) {
            return res.status(400).json({ message: "Owner name must be at least 3 characters long" });
        }
        if (LName && (typeof LName !== "string" || LName.trim().length < 3)) {
            return res.status(400).json({ message: "Library name must be at least 3 characters long" });
        }
        if (city && (typeof city !== "string" || city.trim().length === 0)) {
            return res.status(400).json({ message: "City cannot be empty" });
        }

        if (newSeatsCount !== undefined) {
            const seatsVal = Number(newSeatsCount);
            if (isNaN(seatsVal) || seatsVal <= 0) {
                return res.status(400).json({ message: "Seats must be a positive number" });
            }

            const seat = (await import("../models/seat.js")).default;
            const currentSeatDocsCount = await seat.countDocuments({ createdBy: userID });

            if (seatsVal > currentSeatDocsCount) {
                const additionalSeats = [];
                for (let i = currentSeatDocsCount + 1; i <= seatsVal; i++) {
                    additionalSeats.push({
                        seatNumber: i,
                        createdBy: userID,
                        morning: { isOccupied: false, studentId: null },
                        evening: { isOccupied: false, studentId: null },
                        fullDay: { isOccupied: false, studentId: null },
                    });
                }
                await seat.insertMany(additionalSeats);
            } else if (seatsVal < currentSeatDocsCount) {
                const occupiedExtra = await seat.findOne({
                    createdBy: userID,
                    seatNumber: { $gt: seatsVal },
                    $or: [
                        { "morning.isOccupied": true },
                        { "evening.isOccupied": true },
                        { "fullDay.isOccupied": true }
                    ]
                });
                if (occupiedExtra) {
                    return res.status(400).json({
                        message: `Cannot decrease seats capacity to ${seatsVal}. Seat ${occupiedExtra.seatNumber} is currently occupied.`
                    });
                }
                await seat.deleteMany({ createdBy: userID, seatNumber: { $gt: seatsVal } });
            }
            user.seats = seatsVal;
        }

        if (OName) user.OName = OName.trim();
        if (LName) user.LName = LName.trim();
        if (city) user.city = city.trim();

        if (password) {
            if (password.length < 7) {
                return res.status(400).json({ message: "Password must be at least 7 characters long" });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        return res.status(200).json({
            message: "Profile settings updated successfully",
            user: {
                OName: user.OName,
                LName: user.LName,
                city: user.city,
                seats: user.seats,
                email: user.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email, city, newPassword } = req.body;

        if (!email || !city || !newPassword) {
            return res.status(400).json({ message: "Email, City, and New Password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email does not exist" });
        }

        if (user.city.trim().toLowerCase() !== city.trim().toLowerCase()) {
            return res.status(400).json({ message: "Incorrect security answer (City name does not match)" });
        }

        if (newPassword.length < 7) {
            return res.status(400).json({ message: "New password must be at least 7 characters long" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
