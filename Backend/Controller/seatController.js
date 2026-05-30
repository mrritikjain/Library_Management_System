import seat from "../models/seat.js";
import User from "../models/User.js"; // Import User model to fetch seats capacity
import jwt from "jsonwebtoken"; // 1. Import jwt to decode the token

export const getSeats = async (req, res) => {
  try {
    // 2. Extract the token from the client cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "token is missing" });
    }
    
    // 3. Verify and decode the token to get the logged-in user's ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.userID; // Now userID is defined!

    // 4. Find seats matching the owner who created them
    let seatsList = await seat.find({ createdBy: userID });

    // 5. If no seats exist in database for this new user, auto-initialize them matching their library capacity
    if (seatsList.length === 0) {
      const owner = await User.findById(userID);
      if (owner && owner.seats > 0) {
        const initialSeats = [];
        for (let i = 1; i <= owner.seats; i++) {
          initialSeats.push({
            seatNumber: i,
            createdBy: userID,
            morning: { isOccupied: false, studentId: null },
            evening: { isOccupied: false, studentId: null },
            fullDay: { isOccupied: false, studentId: null },
          });
        }
        await seat.insertMany(initialSeats);
        
        // Refetch the newly created documents
        seatsList = await seat.find({ createdBy: userID });
      }
    }

    // Sort the seats list numerically by seat number
    seatsList.sort((a, b) => a.seatNumber - b.seatNumber);

    console.log("Seats Found for User:", seatsList.length);

    res.status(200).json({
      success: true,
      seats: seatsList,
    });
  } catch (error) {
    console.log("Error in getSeats:", error);
    res.status(500).json({ message: "Error fetching seats" });
  }
};
