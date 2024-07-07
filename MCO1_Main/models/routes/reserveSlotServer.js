const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {
  DateModel,
  LaboratoryNumber,
  TimeSlot,
  SeatStatus,
} = require("../laboratorySchema");

const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/CCAPDEV", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// GET /api/available-dates
router.get("/available-dates", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    const { year, month } = req.query;

    const yearNum = parseInt(year);
    const monthNum = parseInt(month) - 1;

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0);

    const dates = await DateModel.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select("date");

    const availableDates = dates.map((date) => date.date.getDate());

    res.json({ availableDates });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    if (error.message === "Database not connected") {
      res
        .status(500)
        .json({ error: "Database connection error", details: error.message });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  }
});

router.get("/timeslots", async (req, res) => {
  try {
    const { labNumber, date } = req.query;

    // Parse the date and set it to noon UTC to avoid timezone issues
    const queryDate = new Date(date);
    queryDate.setUTCHours(12, 0, 0, 0);

    const dateDoc = await DateModel.findOne({
      date: {
        $gte: new Date(queryDate.getTime()),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!dateDoc) {
      return res.status(404).json({ error: "Date not found" });
    }

    // Find the laboratory for the given lab number and date
    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      populate: {
        path: "seatStatuses",
      },
    });

    if (!laboratory) {
      return res
        .status(404)
        .json({ error: "Laboratory not found for the given date" });
    }

    const formattedTimeslots = laboratory.timeSlots.map((slot) => ({
      timeSlot: slot.timeSlot,
      slotsLeft: calculateAvailableSlots(slot.seatStatuses),
      timeSlotStatus: slot.timeSlotStatus,
    }));

    res.json({ timeslots: formattedTimeslots });
  } catch (error) {
    console.error("Error fetching timeslots:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Helper function to calculate available slots
function calculateAvailableSlots(seatStatuses) {
  return seatStatuses.filter((status) => status.status === "Available").length;
}

router.get("/seat-statuses", async (req, res) => {
  try {
    const { labNumber, timeslot, date } = req.query;

    console.log(
      `Fetching seat statuses for labNumber: ${labNumber}, timeslot: ${timeslot}, date: ${date}`
    );

    const queryDate = new Date(date);
    queryDate.setUTCHours(12, 0, 0, 0);

    console.log(`Query Date: ${queryDate.toISOString()}`);

    const dateDoc = await DateModel.findOne({
      date: {
        $gte: new Date(queryDate.getTime()),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!dateDoc) {
      console.log(`Date not found for queryDate: ${queryDate.toISOString()}`);
      return res.status(404).json({ error: "Date not found" });
    }

    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      match: { timeSlot: timeslot },
      populate: {
        path: "seatStatuses",
      },
    });

    if (!laboratory || laboratory.timeSlots.length === 0) {
      console.log(
        `Time slot not found for labNumber: ${labNumber}, dateDoc._id: ${dateDoc._id}`
      );
      return res.status(404).json({
        error: "Time slot not found for the given laboratory and date",
      });
    }

    const seatStatuses = laboratory.timeSlots[0].seatStatuses;
    console.log(`Seat statuses fetched:`, seatStatuses);
    res.json({ seatStatuses });
  } catch (error) {
    console.error("Error fetching seat statuses:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
