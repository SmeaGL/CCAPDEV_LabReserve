const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

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
    const { username, email, password, userType } = req.body;
    const VALID_USER_TYPES = ["student", "faculty"];
  
    if (!username || !email || !password || !userType) {
        return res.status(400).json({ error: "All fields are required" });
    }

    // Check if userType is valid
    if (!VALID_USER_TYPES.includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
    }
    
    try {
      // Checks if username or email is already in use
      const existingUser = await userProfileModel.findOne({ 
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username or Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user profile
      const newUser = new userProfileModel({
        username,
        email,
        password: hashedPassword,
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
  
    try {
        const user = await userProfileModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
  
      res.status(200).json({ message: "Login successful", user });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  module.exports = router;