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

module.exports = router;
