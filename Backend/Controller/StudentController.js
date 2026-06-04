import Student from "../models/Student.js";
import seat from "../models/seat.js";
import fs from "fs";
import path from "path";

// Helper to release any seat slot occupied by a student
const releaseStudentSeat = async (studentId, createdBy) => {
  await seat.updateOne(
    { createdBy, "morning.studentId": studentId },
    { $set: { "morning.isOccupied": false, "morning.studentId": null } }
  );
  await seat.updateOne(
    { createdBy, "evening.studentId": studentId },
    { $set: { "evening.isOccupied": false, "evening.studentId": null } }
  );
  await seat.updateOne(
    { createdBy, "fullDay.studentId": studentId },
    { $set: { "fullDay.isOccupied": false, "fullDay.studentId": null } }
  );
};

export const createStudent = async (req, res) => {
  try {
    const { name, mobile, plan, feeAmount, seatNumber, slot, joiningDate } = req.body;
    const createdBy = req.userID;

    // Validate inputs
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }
    if (!mobile) {
      return res.status(400).json({ message: "Mobile number is required" });
    }
    if (!plan) {
      return res.status(400).json({ message: "Plan is required" });
    }
    if (feeAmount === undefined || Number(feeAmount) < 0) {
      return res.status(400).json({ message: "Fee amount must be a positive number" });
    }

    const assignedSeat = seatNumber ? Number(seatNumber) : null;
    const assignedSlot = slot || "none";

    // If assigning a seat, check availability
    if (assignedSeat && assignedSlot !== "none") {
      const seatDoc = await seat.findOne({ seatNumber: assignedSeat, createdBy });
      if (!seatDoc) {
        return res.status(400).json({ message: `Seat ${assignedSeat} does not exist.` });
      }

      if (assignedSlot === "fullDay") {
        if (seatDoc.morning.isOccupied || seatDoc.evening.isOccupied || seatDoc.fullDay.isOccupied) {
          return res.status(400).json({ message: `Seat ${assignedSeat} is occupied in one or more slots.` });
        }
      } else if (assignedSlot === "morning") {
        if (seatDoc.morning.isOccupied || seatDoc.fullDay.isOccupied) {
          return res.status(400).json({ message: `Seat ${assignedSeat} morning slot is occupied.` });
        }
      } else if (assignedSlot === "evening") {
        if (seatDoc.evening.isOccupied || seatDoc.fullDay.isOccupied) {
          return res.status(400).json({ message: `Seat ${assignedSeat} evening slot is occupied.` });
        }
      }
    }

    // Save Student
    const student = new Student({
      name: name.trim(),
      mobile: mobile.trim(),
      plan,
      feeAmount: Number(feeAmount),
      seatNumber: assignedSeat,
      slot: assignedSlot,
      joiningDate: joiningDate || undefined,
      aadharCard: req.file ? req.file.filename : undefined,
      createdBy,
    });
    await student.save();

    // Occupy Seat Slot if allocated
    if (assignedSeat && assignedSlot !== "none") {
      const seatDoc = await seat.findOne({ seatNumber: assignedSeat, createdBy });
      if (assignedSlot === "fullDay") {
        seatDoc.fullDay.isOccupied = true;
        seatDoc.fullDay.studentId = student._id;
      } else if (assignedSlot === "morning") {
        seatDoc.morning.isOccupied = true;
        seatDoc.morning.studentId = student._id;
      } else if (assignedSlot === "evening") {
        seatDoc.evening.isOccupied = true;
        seatDoc.evening.studentId = student._id;
      }
      await seatDoc.save();
    }

    res.status(201).json({ success: true, message: "Student registered successfully", student });
  } catch (error) {
    console.error("Error in createStudent:", error);
    // Cleanup uploaded file if DB save fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("File cleanup error:", err);
      }
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const createdBy = req.userID;
    const students = await Student.find({ createdBy }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error in getStudents:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobile, plan, feeAmount, seatNumber, slot, status, joiningDate } = req.body;
    const createdBy = req.userID;

    const student = await Student.findOne({ _id: id, createdBy });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate inputs if provided
    if (name && name.trim().length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    const finalStatus = status !== undefined ? status : student.status;
    
    // If student is Inactive, clear their seat and slot assignment
    const assignedSeat = finalStatus === "Active" 
      ? (seatNumber !== undefined ? (seatNumber ? Number(seatNumber) : null) : student.seatNumber) 
      : null;
    
    const assignedSlot = finalStatus === "Active" 
      ? (slot !== undefined ? slot : student.slot) 
      : "none";

    // Check availability of new seat if changed
    if (assignedSeat && assignedSlot !== "none") {
      const seatDoc = await seat.findOne({ seatNumber: assignedSeat, createdBy });
      if (!seatDoc) {
        return res.status(400).json({ message: `Seat ${assignedSeat} does not exist.` });
      }

      if (assignedSlot === "fullDay") {
        if (
          (seatDoc.morning.isOccupied && String(seatDoc.morning.studentId) !== String(id)) ||
          (seatDoc.evening.isOccupied && String(seatDoc.evening.studentId) !== String(id)) ||
          (seatDoc.fullDay.isOccupied && String(seatDoc.fullDay.studentId) !== String(id))
        ) {
          return res.status(400).json({ message: `Seat ${assignedSeat} is occupied in one or more slots.` });
        }
      } else if (assignedSlot === "morning") {
        if (
          (seatDoc.morning.isOccupied && String(seatDoc.morning.studentId) !== String(id)) ||
          (seatDoc.fullDay.isOccupied && String(seatDoc.fullDay.studentId) !== String(id))
        ) {
          return res.status(400).json({ message: `Seat ${assignedSeat} morning slot is occupied.` });
        }
      } else if (assignedSlot === "evening") {
        if (
          (seatDoc.evening.isOccupied && String(seatDoc.evening.studentId) !== String(id)) ||
          (seatDoc.fullDay.isOccupied && String(seatDoc.fullDay.studentId) !== String(id))
        ) {
          return res.status(400).json({ message: `Seat ${assignedSeat} evening slot is occupied.` });
        }
      }
    }

    // Release old seat slots first
    await releaseStudentSeat(id, createdBy);

    // Update Student
    student.name = name !== undefined ? name.trim() : student.name;
    student.mobile = mobile !== undefined ? mobile.trim() : student.mobile;
    student.plan = plan !== undefined ? plan : student.plan;
    student.feeAmount = feeAmount !== undefined ? Number(feeAmount) : student.feeAmount;
    student.seatNumber = assignedSeat;
    student.slot = assignedSlot;
    student.status = finalStatus;
    student.joiningDate = joiningDate !== undefined ? joiningDate : student.joiningDate;

    if (req.file) {
      // Remove old file if it existed
      if (student.aadharCard) {
        try {
          fs.unlinkSync(path.join("uploads", student.aadharCard));
        } catch (err) {
          console.error("Failed to delete old Aadhar file:", err);
        }
      }
      student.aadharCard = req.file.filename;
    }

    await student.save();

    // If active and has slot, occupy the new seat slot
    if (student.status === "Active" && assignedSeat && assignedSlot !== "none") {
      const seatDoc = await seat.findOne({ seatNumber: assignedSeat, createdBy });
      if (assignedSlot === "fullDay") {
        seatDoc.fullDay.isOccupied = true;
        seatDoc.fullDay.studentId = student._id;
      } else if (assignedSlot === "morning") {
        seatDoc.morning.isOccupied = true;
        seatDoc.morning.studentId = student._id;
      } else if (assignedSlot === "evening") {
        seatDoc.evening.isOccupied = true;
        seatDoc.evening.studentId = student._id;
      }
      await seatDoc.save();
    }

    res.status(200).json({ success: true, message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error in updateStudent:", error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("File cleanup error:", err);
      }
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.userID;

    const student = await Student.findOne({ _id: id, createdBy });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Release seat
    await releaseStudentSeat(id, createdBy);

    // Delete Aadhar Card file from disk
    if (student.aadharCard) {
      try {
        fs.unlinkSync(path.join("uploads", student.aadharCard));
      } catch (err) {
        console.error("Failed to delete Aadhar file on deleteStudent:", err);
      }
    }

    // Delete student
    await Student.deleteOne({ _id: id, createdBy });

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
