import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables from the parent/sibling folder
dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error("❌ Error: Please provide an email address.");
  console.log("Usage: node scripts/makeAdmin.js <user-email>");
  process.exit(1);
}

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is missing from your .env file.");
      process.exit(1);
    }

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected successfully.");

    console.log(`🔎 Finding user with email: ${email.trim()}...`);
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found in database.`);
      process.exit(1);
    }

    user.isSuperAdmin = true;
    user.subscriptionStatus = "Active";
    
    // Set expiry to 10 years out for the platform owner
    const tenYearsOut = new Date();
    tenYearsOut.setFullYear(tenYearsOut.getFullYear() + 10);
    user.subscriptionExpiry = tenYearsOut;

    await user.save();
    
    console.log("\n==================================================");
    console.log(`🎉 SUCCESS: "${email}" is now a Super-Admin!`);
    console.log("✅ isSuperAdmin: true");
    console.log("✅ subscriptionStatus: 'Active'");
    console.log("✅ subscriptionExpiry: 10 Years Expiry");
    console.log("==================================================\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during script execution:", error);
    process.exit(1);
  }
};

run();
