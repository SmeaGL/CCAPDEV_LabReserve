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
} = require("../laboratorySchema");

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb://localhost/CCAPDEV");

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
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

router.post("/confirm-booking", async (req, res) => {
  const { seatNumber, labNumber, bookerName, bookingDate, requestTime } =
    req.query;

  try {
    const queryDate = new Date(bookingDate);
    queryDate.setUTCHours(12, 0, 0, 0);

    const dateDoc = await DateModel.findOne({
      date: {
        $gte: new Date(queryDate.getTime()),
        $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    console.log("Date:", dateDoc.date);
    const laboratory = await LaboratoryNumber.findOne({
      laboratoryNumber: labNumber,
      date: dateDoc._id,
    }).populate({
      path: "timeSlots",
      populate: {
        path: "seatStatuses",
        match: { seatNumber: seatNumber, status: "Available" },
      },
    });
    console.log("Laboratory Data:", laboratory);
    if (
      !laboratory ||
      !laboratory.timeSlots ||
      laboratory.timeSlots.length === 0
    ) {
      console.log("Laboratory or time slot not found:", labNumber);
      return res
        .status(404)
        .json({ message: "Laboratory or time slot not found" });
    }

    const timeSlot = laboratory.timeSlots.find(
      (slot) => slot.seatStatuses.length > 0
    );

    if (!timeSlot) {
      console.log("Time slot not found with available seats:", seatNumber);
      return res
        .status(404)
        .json({ message: "Time slot not found with available seats" });
    }

    const seatStatus = timeSlot.seatStatuses.find(
      (status) => status.seatNumber === seatNumber
    );

    if (!seatStatus) {
      console.log("Seat status not found:", seatNumber);
      return res.status(404).json({ message: "Seat status not found" });
    }

    console.log("Seat status found:", seatStatus);

    if (seatStatus.status !== "Available") {
      console.log("Seat is already booked or unavailable");
      return res
        .status(409)
        .json({ message: "Seat is already booked or unavailable" });
    }

    // Update the seat status
    seatStatus.status = "Booked";
    seatStatus.info = { bookerName, bookingDate, requestTime };

    const updatedSeatStatus = await seatStatus.save();

    console.log("Updated seat status:", updatedSeatStatus); // Log the updated seat status

    res
      .status(200)
      .json({ message: "Booking confirmed", seatStatus: updatedSeatStatus });
  } catch (error) {
    console.error("Error confirming booking:", error);
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
});

module.exports = router;
