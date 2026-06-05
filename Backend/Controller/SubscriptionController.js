import SubscriptionRequest from "../models/SubscriptionRequest.js";
import User from "../models/User.js";

// Helper check for super-admin authority
const checkSuperAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.isSuperAdmin === true;
};

// 1. Submit payment details for manual verification
export const submitSubscriptionRequest = async (req, res) => {
  try {
    const { name, transactionId } = req.body;

    if (!name || !transactionId) {
      return res.status(400).json({ message: "Name and Transaction ID are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Payment confirmation screenshot is required" });
    }

    const existingRequest = await SubscriptionRequest.findOne({ transactionId: transactionId.trim() });
    if (existingRequest) {
      return res.status(400).json({ message: "A request with this Transaction ID has already been submitted" });
    }

    const newRequest = new SubscriptionRequest({
      user: req.userID,
      name: name.trim(),
      transactionId: transactionId.trim(),
      screenshot: req.file.filename,
      status: "Pending",
    });

    await newRequest.save();

    // Update user subscriptionStatus to Pending
    await User.findByIdAndUpdate(req.userID, { subscriptionStatus: "Pending" });

    return res.status(201).json({
      message: "Subscription request submitted successfully. Awaiting admin approval.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Submit subscription request error:", error);
    return res.status(500).json({ message: "Failed to submit subscription request" });
  }
};

// 2. Get all pending subscription requests (Super-Admin only)
export const getPendingRequests = async (req, res) => {
  try {
    const isSuper = await checkSuperAdmin(req.userID);
    if (!isSuper) {
      return res.status(403).json({ message: "Forbidden: Super-Admin access only" });
    }

    const requests = await SubscriptionRequest.find({ status: "Pending" })
      .populate("user", "OName LName email city")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Get pending requests error:", error);
    return res.status(500).json({ message: "Failed to retrieve pending subscription requests" });
  }
};

// 3. Approve manual subscription (Super-Admin only)
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuper = await checkSuperAdmin(req.userID);
    if (!isSuper) {
      return res.status(403).json({ message: "Forbidden: Super-Admin access only" });
    }

    const request = await SubscriptionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Subscription request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: `Request is already ${request.status.toLowerCase()}` });
    }

    // Set request status to Approved
    request.status = "Approved";
    await request.save();

    // Set subscriptionExpiry to 365 days from now and status to Active
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    await User.findByIdAndUpdate(request.user, {
      subscriptionStatus: "Active",
      subscriptionExpiry: oneYearFromNow,
    });

    return res.status(200).json({ message: "Subscription request approved. Access granted for 1 year." });
  } catch (error) {
    console.error("Approve request error:", error);
    return res.status(500).json({ message: "Failed to approve request" });
  }
};

// 4. Reject manual subscription (Super-Admin only)
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuper = await checkSuperAdmin(req.userID);
    if (!isSuper) {
      return res.status(403).json({ message: "Forbidden: Super-Admin access only" });
    }

    const request = await SubscriptionRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Subscription request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: `Request is already ${request.status.toLowerCase()}` });
    }

    // Set request status to Rejected
    request.status = "Rejected";
    await request.save();

    // Set user subscriptionStatus back to Expired
    await User.findByIdAndUpdate(request.user, {
      subscriptionStatus: "Expired",
    });

    return res.status(200).json({ message: "Subscription request rejected." });
  } catch (error) {
    console.error("Reject request error:", error);
    return res.status(500).json({ message: "Failed to reject request" });
  }
};
