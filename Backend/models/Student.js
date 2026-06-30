import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  aadharCard: {
    type: String,
  },
  mobile: {
    type: String,
    required: true,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  plan: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  seatNumber: {
    type: Number,
    default: null,
  },
  slot: {
    type: String,
    enum: ["morning", "evening", "fullDay", "none"],
    default: "none",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

StudentSchema.index({ createdBy: 1 });

export default mongoose.model("Student", StudentSchema);
