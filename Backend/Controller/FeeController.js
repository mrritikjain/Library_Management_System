import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

export const createFee = async (req, res) => {
  try {
    const { studentId, amountPaid, paymentDate, dueDate, paymentMode, remarks } = req.body;
    const createdBy = req.userID;

    if (!studentId) {
      return res.status(400).json({ message: "Student is required" });
    }
    if (amountPaid === undefined || Number(amountPaid) <= 0) {
      return res.status(400).json({ message: "Amount paid must be greater than zero" });
    }

    const student = await Student.findOne({ _id: studentId, createdBy });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let finalDueDate = dueDate;
    if (!finalDueDate) {
      const plan = student.plan || "Monthly";
      let planDays = 30;
      if (plan === "Weekly") planDays = 7;
      else if (plan === "15 Days") planDays = 15;
      else if (plan === "Quarterly") planDays = 90;
      else if (plan === "Half-Yearly") planDays = 180;
      else if (plan === "Yearly") planDays = 365;

      const pDate = paymentDate ? new Date(paymentDate) : new Date();
      
      // Proportional calculation for installments/partial payments
      const proportionalDays = student.feeAmount > 0
        ? (Number(amountPaid) / student.feeAmount) * planDays
        : planDays;

      // Determine the start date of this payment coverage
      const lastFee = await Fee.findOne({ studentId, createdBy }).sort({ paymentDate: -1 });
      let startDate = pDate;
      if (lastFee && lastFee.dueDate && new Date(pDate) < new Date(lastFee.dueDate)) {
        // If the student's previous subscription hasn't expired yet, extend it
        startDate = new Date(lastFee.dueDate);
      } else if (!lastFee && student.joiningDate) {
        // For old users registered with a backdated joiningDate
        const joinDate = new Date(student.joiningDate);
        if (joinDate < pDate) {
          startDate = joinDate;
        }
      }

      finalDueDate = new Date(startDate.getTime() + proportionalDays * 24 * 60 * 60 * 1000);
    }

    const fee = new Fee({
      studentId,
      amountPaid: Number(amountPaid),
      paymentDate: paymentDate || undefined,
      dueDate: finalDueDate,
      paymentMode: paymentMode || "UPI",
      remarks: remarks ? remarks.trim() : "",
      createdBy,
    });
    await fee.save();

    res.status(201).json({ success: true, message: "Fee payment recorded successfully", fee });
  } catch (error) {
    console.error("Error in createFee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFees = async (req, res) => {
  try {
    const createdBy = req.userID;
    const fees = await Fee.find({ createdBy })
      .populate("studentId", "name email mobile plan")
      .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, fees });
  } catch (error) {
    console.error("Error in getFees:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;
    const createdBy = req.userID;

    const fee = await Fee.findOne({ _id: id, createdBy });
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    await Fee.deleteOne({ _id: id, createdBy });
    res.status(200).json({ success: true, message: "Fee payment deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
