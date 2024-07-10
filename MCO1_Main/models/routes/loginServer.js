const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();

const {
    userProfileModel,
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

// POST /api/register
router.post("/register", async (req, res) => {
    const { username, email, password, userType } = req.query;
  
    try {
      // Checks if username or email is already in use
      const existingUser = await userProfileModel.findOne({ 
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
  
      // Create a new user profile
      const newUser = new userProfileModel({
        username,
        email,
        password,
        userType,
      });
  
      await newUser.save();
      res.status(201).json({ message: "User successfully registered" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// GET /api/login
router.post("/login", async (req, res) => {
    const { email, password } = req.query;
  
    try {
      const user = await userProfileModel.findOne({ email, password });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
  
      res.status(200).json({ message: "Login successful", user });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ error: "Internal server error" });
    }

    console.log(user);
  });
  
  module.exports = router;