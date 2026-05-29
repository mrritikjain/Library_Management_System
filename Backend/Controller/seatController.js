import seat from "../models/seat.js";

export const getSeats =async(req,res)=>{
try { 
    const seats = await seat.find({
      createdBy: req.userID,
    });

    res.status(200).json({
      success: true,
      seats,
    });
} catch (error) {
    res.status(500).json({message: "Seats not found"});
}
}