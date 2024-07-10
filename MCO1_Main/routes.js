const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { DateModel } = require("./models/laboratorySchema");

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

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

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

module.exports = router;
