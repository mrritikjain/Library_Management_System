import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
   OName: {
     type: String,
     required: true,
     minlength: 3,
   },
   LName: {
     type: String,
     required: true,
     minlength: 3,
   },
   city: {
     type: String,
     required: true,
   },
   seats: {
     type: Number,
     required: true,
   },
   email: {
     type: String,
     required: true,
     unique: true,
     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
   },
   password: {
     type: String,
     required: true,
     minlength: 7,
   },
   subscriptionStatus: {
     type: String,
     enum: ["Trial", "Pending", "Active", "Expired"],
     default: "Trial",
   },
   subscriptionExpiry: {
     type: Date,
   },
   isSuperAdmin: {
     type: Boolean,
     default: false,
   }
}, { timestamps: true }); // lowercase 't'

export default mongoose.model("User",UserSchema);