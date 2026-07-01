import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import MessageLog from "../models/MessageLog.js";

// Helper to send simulated SMS (logs only)
const sendSMS = async (mobile, text) => {
  console.log(`[SIMULATED SMS] Sent to +91 ${mobile}: "${text}"`);
};

// Helper to map plan names to days
export const getPlanDays = (plan) => {
  switch (plan) {
    case "Weekly": return 7;
    case "15 Days": return 15;
    case "Monthly": return 30;
    case "Quarterly": return 90;
    case "Half-Yearly": return 180;
    case "Yearly": return 365;
    default: return 30;
  }
};

// Helper to compute difference in days (d1 - d2)
export const getDifferenceInDays = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  date1.setHours(12, 0, 0, 0);
  date2.setHours(12, 0, 0, 0);
  const diffTime = date1.getTime() - date2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Send immediate registration message
export const sendRegistrationMessage = async (student, user) => {
  try {
    const libraryName = user.LName || "the Library";
    const dateString = new Date(student.joiningDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const messageText = `Hello ${student.name}, welcome to ${libraryName}! Your registration is successful for the ${student.plan} plan starting from ${dateString}.`;

    // Send via SMS
    await sendSMS(student.mobile, messageText);

    // Log in database
    const messageLog = new MessageLog({
      studentId: student._id,
      type: "registration",
      message: messageText,
      referenceDate: student.joiningDate,
      createdBy: user._id,
    });
    await messageLog.save();
    return messageLog;
  } catch (error) {
    console.error("Error sending registration message:", error);
  }
};

// Main notification checking cron logic
export const runNotificationCron = async () => {
  try {
    console.log("Running notification check cron...");
    const currentDate = new Date();
    
    // Find all active students and populate creator (library owner)
    const students = await Student.find({ status: "Active" }).populate("createdBy");
    
    let processedCount = 0;
    let messagesSent = [];

    for (const student of students) {
      if (!student.createdBy) continue;
      
      const user = student.createdBy;
      const libraryName = user.LName || "the Library";
      const planDays = getPlanDays(student.plan);
      
      // Fetch all fees for this student, sorted by paymentDate desc
      const fees = await Fee.find({ studentId: student._id }).sort({ paymentDate: -1 });
      
      if (fees.length === 0) {
        // Rule 1: No fees submitted
        const joiningDate = new Date(student.joiningDate);
        const daysSinceJoining = getDifferenceInDays(currentDate, joiningDate);
        
        if (daysSinceJoining >= 3) {
          // Check if already notified
          const alreadyNotified = await MessageLog.findOne({
            studentId: student._id,
            type: "no_fees_3_days"
          });
          
          if (!alreadyNotified) {
            const messageText = `Hello ${student.name}, this is a reminder to deposit your fees of ₹${student.feeAmount} for the ${student.plan} plan at ${libraryName}. Please submit it as soon as possible.`;
            
            // Send via SMS
            await sendSMS(student.mobile, messageText);
            
            const log = new MessageLog({
              studentId: student._id,
              type: "no_fees_3_days",
              message: messageText,
              referenceDate: student.joiningDate,
              createdBy: user._id,
            });
            await log.save();
            
            messagesSent.push({ student: student.name, type: "no_fees_3_days", text: messageText });
          }
        }
      } else {
        // Student has paid fee records
        const lastFee = fees[0];
        
        // Calculate expiry date (based on lastFee dueDate, or computed paymentDate + planDays)
        let expiryDate;
        if (lastFee.dueDate) {
          expiryDate = new Date(lastFee.dueDate);
        } else {
          const payDate = new Date(lastFee.paymentDate);
          expiryDate = new Date(payDate.getTime() + planDays * 24 * 60 * 60 * 1000);
        }
        
        const daysToExpiry = getDifferenceInDays(expiryDate, currentDate);
        const dateString = expiryDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        if (daysToExpiry === 3) {
          // Rule 2: Subscription going to end 3 days before
          const alreadyNotified = await MessageLog.findOne({
            studentId: student._id,
            type: "expiry_3_days_before",
            referenceDate: expiryDate,
          });
          
          if (!alreadyNotified) {
            const seatInfo = student.seatNumber ? ` Desk-${String(student.seatNumber).padStart(2, "0")}` : "";
            const messageText = `Hello ${student.name}, your subscription for the ${student.plan} plan at ${libraryName} will expire on ${dateString}. Please renew it to continue your seat${seatInfo}.`;
            
            // Send via SMS
            await sendSMS(student.mobile, messageText);
            
            const log = new MessageLog({
              studentId: student._id,
              type: "expiry_3_days_before",
              message: messageText,
              referenceDate: expiryDate,
              createdBy: user._id,
            });
            await log.save();
            
            messagesSent.push({ student: student.name, type: "expiry_3_days_before", text: messageText });
          }
        } else if (daysToExpiry === 0) {
          // Rule 3: Expiry day reminder
          const alreadyNotified = await MessageLog.findOne({
            studentId: student._id,
            type: "expiry_day",
            referenceDate: expiryDate,
          });
          
          if (!alreadyNotified) {
            const messageText = `Hello ${student.name}, your subscription at ${libraryName} expires today (${dateString}). Please deposit your due fees of ₹${student.feeAmount} to avoid seat cancellation.`;
            
            // Send via SMS
            await sendSMS(student.mobile, messageText);
            
            const log = new MessageLog({
              studentId: student._id,
              type: "expiry_day",
              message: messageText,
              referenceDate: expiryDate,
              createdBy: user._id,
            });
            await log.save();
            
            messagesSent.push({ student: student.name, type: "expiry_day", text: messageText });
          }
        } else if (daysToExpiry < 0) {
          // Rule 4: Overdue reminder every 3 days after expiry
          const daysOverdue = -daysToExpiry;
          
          if (daysOverdue >= 3) {
            // Find all overdue logs for this expiry cycle
            const overdueLogs = await MessageLog.find({
              studentId: student._id,
              type: "expiry_overdue_3_days",
              referenceDate: expiryDate,
            }).sort({ sentAt: -1 });
            
            let shouldSend = false;
            
            if (overdueLogs.length === 0) {
              shouldSend = true;
            } else {
              const lastOverdueLog = overdueLogs[0];
              const daysSinceLastLog = getDifferenceInDays(currentDate, lastOverdueLog.sentAt);
              if (daysSinceLastLog >= 3) {
                shouldSend = true;
              }
            }
            
            if (shouldSend) {
              const messageText = `Hello ${student.name}, this is a reminder that your subscription at ${libraryName} expired on ${dateString}. Your fees of ₹${student.feeAmount} are overdue by ${daysOverdue} days. Please deposit immediately to retain your seat.`;
              
              // Send via SMS
              await sendSMS(student.mobile, messageText);
              
              const log = new MessageLog({
                studentId: student._id,
                type: "expiry_overdue_3_days",
                message: messageText,
                referenceDate: expiryDate,
                createdBy: user._id,
              });
              await log.save();
              
              messagesSent.push({ student: student.name, type: "expiry_overdue_3_days", text: messageText });
            }
          }
        }
      }
      processedCount++;
    }
    
    console.log(`Notification cron finished. Processed ${processedCount} active students. Sent ${messagesSent.length} alerts.`);
    return { processedCount, sentCount: messagesSent.length, messagesSent };
  } catch (error) {
    console.error("Error running notification cron:", error);
    throw error;
  }
};
