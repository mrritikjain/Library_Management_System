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

    // 4. Find seats matching the owner who created them and populate student details
    let seatsList = await seat.find({ createdBy: userID })
      .populate("morning.studentId evening.studentId fullDay.studentId", "name email mobile plan");

    // 5. Auto-initialize or expand seats matching user's library capacity if records are missing
    const owner = await User.findById(userID);
    if (owner && owner.seats > seatsList.length) {
      const currentSeatDocsCount = seatsList.length;
      const additionalSeats = [];
      for (let i = currentSeatDocsCount + 1; i <= owner.seats; i++) {
        additionalSeats.push({
          seatNumber: i,
          createdBy: userID,
          morning: { isOccupied: false, studentId: null },
          evening: { isOccupied: false, studentId: null },
          fullDay: { isOccupied: false, studentId: null },
        });
      }
      await seat.insertMany(additionalSeats);
      
      // Refetch with populates
      seatsList = await seat.find({ createdBy: userID })
        .populate("morning.studentId evening.studentId fullDay.studentId", "name email mobile plan");
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
