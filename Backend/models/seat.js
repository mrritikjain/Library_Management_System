import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
  },
  morning: {
    isOccupied: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    }
  },
  evening: {
    isOccupied: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    }
  },
  fullDay: {
    isOccupied: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("seat", SeatSchema);
