import User from "../models/User.js";

export const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.userID);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Bypass check for super-admin accounts
    if (user.isSuperAdmin) {
      return next();
    }

    // Check if the 15-day trial is still active
    const trialDuration = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
    const registrationTime = new Date(user.createdAt).getTime();
    const isTrialValid = (Date.now() - registrationTime) <= trialDuration;

    // Check if the subscription status is currently active
    const isSubscribed = user.subscriptionStatus === "Active";

    if (!isTrialValid && !isSubscribed) {
      return res.status(403).json({
        message: "Subscription required",
        subscriptionStatus: user.subscriptionStatus || "Expired",
        trialExpired: true,
      });
    }

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    return res.status(500).json({ message: "Internal Server Error during subscription check" });
  }
};
