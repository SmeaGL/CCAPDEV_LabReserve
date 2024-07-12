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
} = require("../laboratorySchema");

router.get("/getRoomSeatDateTime", async (req, res) => {
  const email = req.session.user.email;

  try {
    // Find the user profile
    const userProfile = await userProfileModel.findOne({ email }).populate({
      path: "bookings",
      populate: [
        {
          path: "timeSlot",
          populate: {
            path: "laboratory",
            populate: {
              path: "date",
            },
          },
        },
      ],
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    // Construct the response
    const bookings = userProfile.bookings.map((booking) => {
      return {
        date: booking.timeSlot.laboratory.date.date,
        laboratoryNumber: booking.timeSlot.laboratory.laboratoryNumber,
        timeSlot: booking.timeSlot.timeSlot,
        seatNumber: booking.seatNumber,
        status: booking.status,
        bookerName: booking.info.bookerName,
        bookerEmail: booking.info.bookerEmail,
        bookingDate: booking.info.bookingDate,
        requestTime: booking.info.requestTime,
      };
    });

    bookings.sort((a, b) => {
      // Sort by date
      const dateComparison = new Date(b.date) - new Date(a.date);
      if (dateComparison !== 0) {
        return dateComparison;
      }

      // Sort by time slot
      const timeSlotComparison = b.timeSlot.localeCompare(a.timeSlot);
      if (timeSlotComparison !== 0) {
        return timeSlotComparison;
      }

      // Sort by room number
      const roomNumberComparison = a.laboratoryNumber - b.laboratoryNumber;
      if (roomNumberComparison !== 0) {
        return roomNumberComparison;
      }

      // Sort by seat number
      return a.seatNumber - b.seatNumber;
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error retrieving user bookings:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/cancelbooking", async (req, res) => {
  const { seatNumber, labNumber, bookingDate, timeslot } = req.query;
  const bookerEmail = req.session.user.email;

  console.log("Received cancel booking request", {
    seatNumber,
    labNumber,
    bookingDate,
    timeslot,
    bookerEmail,
  }); // Debugging line

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
      console.log("Date not found"); // Debugging line
      return res.status(404).json({ message: "Date not found" });
    }

    console.log("Date document found", dateDoc); // Debugging line

    // Find the laboratory document
    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      match: { timeSlot: timeslot },
      populate: {
        path: "seatStatuses",
        match: { seatNumber: seatNumber }, // Note: Removed status filter for debugging
      },
    });

    if (!laboratory) {
      console.log("Laboratory not found"); // Debugging line
      return res.status(404).json({ message: "Laboratory not found" });
    }

    console.log("Laboratory found with timeSlots", laboratory.timeSlots); // Debugging line

    // Find the specific time slot and seat status
    const timeSlot = laboratory.timeSlots.find(
      (slot) => slot.timeSlot === timeslot
    );

    if (!timeSlot) {
      console.log("Time slot not found"); // Debugging line
      return res.status(404).json({ message: "Time slot not found" });
    }

    console.log("Time slot found with seatStatuses", timeSlot.seatStatuses); // Debugging line

    // If seatStatuses is empty, log the entire laboratory document for debugging
    if (timeSlot.seatStatuses.length === 0) {
      console.log("Time slot details", timeSlot);
    }

    const seatStatus = timeSlot.seatStatuses.find(
      (status) => status.seatNumber === seatNumber && status.status === "Booked"
    );

    if (!seatStatus) {
      console.log("Booking not found or already cancelled"); // Debugging line
      return res
        .status(404)
        .json({ message: "Booking not found or already cancelled" });
    }

    // Update seat status to available and clear booking info
    seatStatus.status = "Available";
    seatStatus.info = {};
    const cancelledSeatStatus = await seatStatus.save();

    // Remove reference from user's profile
    await userProfileModel.updateOne(
      { email: bookerEmail },
      { $pull: { bookings: seatStatus._id } }
    );

    res
      .status(200)
      .json({ message: "Booking cancelled", seatStatus: cancelledSeatStatus });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
});

module.exports = router;
