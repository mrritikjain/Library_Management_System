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

    // 3. Fetch active students & calculate dueFeesCount
    const activeStudents = await Student.find({
      createdBy: userID,
      status: "Active"
    });
    const totalStudents = activeStudents.length;

    const activeStudentIds = activeStudents.map(s => s._id);
    const activeFees = await Fee.find({ studentId: { $in: activeStudentIds } }).sort({ paymentDate: -1 });

    const feesMap = {};
    activeFees.forEach(fee => {
      const sId = String(fee.studentId);
      if (!feesMap[sId]) {
        feesMap[sId] = [];
      }
      feesMap[sId].push(fee);
    });

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

    let dueFeesCount = 0;
    activeStudents.forEach(student => {
      const studentFees = feesMap[String(student._id)] || [];
      const planDays = getPlanDays(student.plan);
      const joinDate = new Date(student.joiningDate || student.createdAt);
      
      let isDue = false;
      if (studentFees.length === 0) {
        isDue = true;
      } else {
        const lastFee = studentFees[0];
        let expiryDate;
        if (lastFee.dueDate) {
          expiryDate = new Date(lastFee.dueDate);
        } else {
          const payDate = new Date(lastFee.paymentDate);
          expiryDate = new Date(payDate.getTime() + planDays * 24 * 60 * 60 * 1000);
        }
        isDue = new Date() >= expiryDate;
      }
      if (isDue) {
        dueFeesCount++;
      }
    });

    // 4. & 5. Calculate total fees collected and total expenses in parallel
    const [feesAggregate, expensesAggregate] = await Promise.all([
      Fee.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userID) } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } }
      ]),
      Expense.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userID) } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const feesCollected = feesAggregate.length > 0 ? feesAggregate[0].total : 0;
    const totalExpenses = expensesAggregate.length > 0 ? expensesAggregate[0].total : 0;
    const netProfit = feesCollected - totalExpenses;

    // 6. Fetch recent 5 students and determine their billing status
    const recentStudentsList = await Student.find({ createdBy: userID })
      .sort({ createdAt: -1 })
      .limit(5);

    // Batch query all fees for the recent students to prevent N+1 loop query database calls
    const recentStudentIds = recentStudentsList.map(s => s._id);
    const recentStudentFeesList = await Fee.find({ studentId: { $in: recentStudentIds } }).sort({ paymentDate: -1 });

    // Group fees by studentId in memory
    const recentFeesMap = {};
    recentStudentFeesList.forEach(fee => {
      const sId = String(fee.studentId);
      if (!recentFeesMap[sId]) {
        recentFeesMap[sId] = [];
      }
      recentFeesMap[sId].push(fee);
    });

    const recentActivities = recentStudentsList.map(student => {
      const studentFees = recentFeesMap[String(student._id)] || [];
      let status = "Paid";
      
      if (student.status === "Inactive") {
        status = "Inactive";
      } else {
        const planDays = getPlanDays(student.plan);
        if (studentFees.length === 0) {
          status = "Pending";
        } else {
          const lastFee = studentFees[0];
          let expiryDate;
          if (lastFee.dueDate) {
            expiryDate = new Date(lastFee.dueDate);
          } else {
            const payDate = new Date(lastFee.paymentDate);
            expiryDate = new Date(payDate.getTime() + planDays * 24 * 60 * 60 * 1000);
          }
          if (new Date() > expiryDate) {
            status = "Expired";
          } else if (new Date() >= expiryDate) {
            status = "Due";
          } else {
            status = "Paid";
          }
        }
      }

      return {
        _id: student._id,
        name: student.name,
        seat: student.seatNumber ? `Desk-${String(student.seatNumber).padStart(2, "0")}` : "Unassigned",
        plan: student.plan,
        status,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalSeats,
        occupiedSeats,
        availableSeats,
        totalStudents,
        dueFeesCount,
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
