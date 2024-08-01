const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const {
  DateModel,
  LaboratoryNumber,
  TimeSlot,
  SeatStatus,
  userProfileModel,
} = require("../models/laboratorySchema");

router.post("/hasBooking", async (req, res) => {
  const { seatNumber, labNumber, bookingDate, timeslot } = req.query;
  const bookerEmail = req.session.user.email;

  try {
    const queryDate = new Date(bookingDate + "T00:00:00Z");
    const nextDay = new Date(queryDate);
    nextDay.setUTCDate(queryDate.getUTCDate() + 1);

    const dateDoc = await DateModel.findOne({
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
    });

    if (!dateDoc) {
      return res.status(404).json({ message: "Date not found" });
    }

    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      match: { timeSlot: timeslot },
      populate: {
        path: "seatStatuses",
        match: { seatNumber: seatNumber },
      },
    });

    if (!laboratory) {
      return res.status(404).json({ message: "Laboratory not found" });
    }

    // Find the specific time slot and seat status
    const timeSlot = laboratory.timeSlots.find(
      (slot) => slot.timeSlot === timeslot
    );

    if (!timeSlot) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    const seatStatus = timeSlot.seatStatuses.find(
      (status) => status.seatNumber === seatNumber && status.status === "Booked"
    );

    if (!seatStatus) {
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled" });
    }

    res.status(200).json({ message: "Booking found", seatStatus: seatStatus });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
});

module.exports = router;
