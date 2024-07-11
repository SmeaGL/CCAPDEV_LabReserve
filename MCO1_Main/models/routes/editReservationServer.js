const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const { userProfileModel } = require("../laboratorySchema");

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

  // Accessing user information from session (optional for cancellation, depends on your authentication flow)
  const bookerEmail = req.session.user.email;

  try {
    const queryDate = new Date(bookingDate);
    queryDate.setUTCHours(12, 0, 0, 0);

    // Find the date document for the specified date
    const dateDoc = await DateModel.findOne({
      date: {
        $gte: new Date(queryDate.getTime()),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
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
        match: { seatNumber: seatNumber, status: "Booked" },
      },
    });

    if (!laboratory) {
      return res.status(404).json({ message: "Laboratory not found" });
    }

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

    // Update seat status to available and clear booking info
    seatStatus.status = "Available";
    seatStatus.info = {};
    const cancelledSeatStatus = await seatStatus.save();

    // Remove reference from user's profile
    if (bookerEmail) {
      await userProfileModel.updateOne(
        { email: bookerEmail },
        { $pull: { bookings: seatStatus._id } }
      );
    }

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
