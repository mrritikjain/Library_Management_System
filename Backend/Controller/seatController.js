import seat from "../models/seat.js";
import User from "../models/User.js"; // Import User model to fetch seats capacity
import Fee from "../models/Fee.js"; // Import Fee model to check student dues
import jwt from "jsonwebtoken"; // 1. Import jwt to decode the token

const getPlanDays = (plan) => {
  switch (plan) {
    case "Quarterly": return 90;
    case "Half-Yearly": return 180;
    case "Yearly": return 365;
    case "Monthly":
    default:
      return 30;
  }
};

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

    const studentFields = "name email mobile plan joiningDate feeAmount";

    // 4. Find seats matching the owner who created them and populate student details
    let seatsList = await seat.find({ createdBy: userID })
      .populate("morning.studentId evening.studentId fullDay.studentId", studentFields);

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
        .populate("morning.studentId evening.studentId fullDay.studentId", studentFields);
    }

    // Sort the seats list numerically by seat number
    seatsList.sort((a, b) => a.seatNumber - b.seatNumber);

    // Collect all student IDs to batch query their fee histories
    const studentIds = [];
    seatsList.forEach(sDoc => {
      ["morning", "evening", "fullDay"].forEach(slot => {
        if (sDoc[slot] && sDoc[slot].studentId) {
          studentIds.push(sDoc[slot].studentId._id || sDoc[slot].studentId);
        }
      });
    });

    // Fetch fee records for active students
    const allFees = await Fee.find({ studentId: { $in: studentIds } }).sort({ paymentDate: -1 });

    // Group fees by student
    const feesMap = {};
    allFees.forEach(fee => {
      const sId = String(fee.studentId);
      if (!feesMap[sId]) {
        feesMap[sId] = [];
      }
      feesMap[sId].push(fee);
    });

    // Convert mongoose documents to plain objects and append due/expired calculations
    const finalSeats = seatsList.map(s => {
      const sObj = s.toObject();
      ["morning", "evening", "fullDay"].forEach(slot => {
        if (sObj[slot] && sObj[slot].studentId) {
          const student = sObj[slot].studentId;
          const studentFees = feesMap[String(student._id)] || [];
          
          let isDue = false;
          let isExpired = false;
          let expiryDate = null;
          
          const planDays = getPlanDays(student.plan);
          const joinDate = new Date(student.joiningDate || student.createdAt);
          
          if (studentFees.length === 0) {
            expiryDate = new Date(joinDate.getTime() + planDays * 24 * 60 * 60 * 1000);
            isDue = true;
            isExpired = new Date() > expiryDate;
          } else {
            const lastFee = studentFees[0];
            if (lastFee.dueDate) {
              expiryDate = new Date(lastFee.dueDate);
            } else {
              const payDate = new Date(lastFee.paymentDate);
              expiryDate = new Date(payDate.getTime() + planDays * 24 * 60 * 60 * 1000);
            }
            isExpired = new Date() > expiryDate;
            isDue = new Date() >= expiryDate;
          }
          
          student.isDue = isDue;
          student.isExpired = isExpired;
          student.expiryDate = expiryDate;
        }
      });
      return sObj;
    });

    console.log("Seats Found and Checked for User:", finalSeats.length);

    res.status(200).json({
      success: true,
      seats: finalSeats,
    });
  } catch (error) {
    console.log("Error in getSeats:", error);
    res.status(500).json({ message: "Error fetching seats" });
  }
};
