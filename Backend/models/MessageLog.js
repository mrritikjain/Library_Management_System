import mongoose from "mongoose";

const MessageLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "registration",
      "no_fees_3_days",
      "expiry_3_days_before",
      "expiry_day",
      "expiry_overdue_3_days"
    ],
  },
  message: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  referenceDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("MessageLog", MessageLogSchema);
