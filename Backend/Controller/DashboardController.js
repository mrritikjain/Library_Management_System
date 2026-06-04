import User from "../models/User.js";
import Student from "../models/Student.js";
import seat from "../models/seat.js";
import Fee from "../models/Fee.js";
import Expense from "../models/Expense.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const userID = req.userID;

    // 1. Fetch User details for capacity
    const owner = await User.findById(userID);
    if (!owner) {
      return res.status(404).json({ message: "User not found" });
    }
    const totalSeats = owner.seats || 0;

    // 2. Count occupied seats
    const occupiedSeats = await seat.countDocuments({
      createdBy: userID,
      $or: [
        { "morning.isOccupied": true },
        { "evening.isOccupied": true },
        { "fullDay.isOccupied": true }
      ]
    });
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    // 3. Count active students
    const totalStudents = await Student.countDocuments({
      createdBy: userID,
      status: "Active"
    });

    // 4. Calculate total fees collected
    const feesAggregate = await Fee.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userID) } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);
    const feesCollected = feesAggregate.length > 0 ? feesAggregate[0].total : 0;

    // 5. Calculate total expenses
    const expensesAggregate = await Expense.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(userID) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expensesAggregate.length > 0 ? expensesAggregate[0].total : 0;

    const netProfit = feesCollected - totalExpenses;

    // 6. Fetch recent 5 students and determine their billing status
    const recentStudentsList = await Student.find({ createdBy: userID })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = [];
    for (const student of recentStudentsList) {
      // Find if this student has any fee records
      const hasFee = await Fee.findOne({ studentId: student._id, createdBy: userID });
      recentActivities.push({
        _id: student._id,
        name: student.name,
        seat: student.seatNumber ? `Desk-${String(student.seatNumber).padStart(2, "0")}` : "Unassigned",
        plan: student.plan,
        status: hasFee ? "Paid" : "Pending",
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalSeats,
        occupiedSeats,
        availableSeats,
        totalStudents,
        feesCollected,
        totalExpenses,
        netProfit,
        recentActivities,
      }
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
