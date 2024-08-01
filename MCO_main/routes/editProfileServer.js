const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { userProfileModel } = require("../models/laboratorySchema");

//Used multer library for image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads")); // Save images to public/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

//Validation to accept image only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only images are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFilter });

// Middleware to parse JSON
router.use(express.json());

// GET /api/publicProfile
router.get("/publicProfile", async (req, res) => {
  try {
    const allProfiles = await userProfileModel.find();
    res.status(200).json(allProfiles);
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    res.status(500).json({ error: "Failed to fetch user profiles" });
  }
});

// GET /api/profile - Fetch the current user's profile
router.get("/profile", async (req, res) => {
  const email = req.session.user.email;

  try {
    const userProfile = await userProfileModel.findOne({ email });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// PUT /api/profile - Update the current user's profile
router.put("/profile", upload.single("profilePicture"), async (req, res) => {
  const email = req.session.user.email; // Assuming the email is stored in the session

  const { username, description, userType } = req.body;
  const profilePicture = req.file
    ? "/uploads/" + req.file.filename
    : req.session.user.profilePicture;

  try {
    const updatedProfile = await userProfileModel.findOneAndUpdate(
      { email },
      { username, description, userType, profilePicture },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Update session data
    req.session.user = updatedProfile;

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
});

// DELETE /api/profile - Delete the current user's profile
router.delete("/profile", async (req, res) => {
  const email = req.session.user.email;

  try {
    const deletedProfile = await userProfileModel.findOneAndDelete({ email });

    if (!deletedProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting user profile:", error);
    res.status(500).json({ error: "Failed to delete user profile" });
  }
});

module.exports = router;
