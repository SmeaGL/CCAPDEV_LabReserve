const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const Handlebars = require("handlebars");
const mongoose = require("mongoose");
const mongoStore = require("connect-mongo");
const { engine } = require("express-handlebars");
const path = require("path");
const populateLaboratory = require("./populateLaboratory");

// Import the models
const {
  DateModel,
  LaboratoryNumber,
  TimeSlot,
  SeatStatus,
  userProfileModel,
} = require("./models/laboratorySchema");

const routesRes = require("./routes/reserveSlotServer");
const routesLog = require("./routes/loginServer");
const routesEdit = require("./routes/editReservationServer");
const routesProfile = require("./routes/profileServer");
const editProfileRoutes = require("./routes/editProfileServer");
const replaceBookingRoutes = require("./routes/replaceBookingServer");

const app = express();

// Configure Handlebarss
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
      ifCond: function (v1, v2, options) {
        if (v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost/CCAPDEV",
      collectionName: "sessions",
    }),
  })
);

// Configure cookie parser
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/CCAPDEV");

// Routes
app.use("/api", routesRes);
app.use("/api", routesLog);
app.use("/api", routesEdit);
app.use("/api", routesProfile);
app.use("/api", editProfileRoutes);
app.use("/api", replaceBookingRoutes);

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Define routes
app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Information",
    logo: "Contact Information",
    isAuthenticated: false,
    layout: "main",
    style: "contact.css",
    javascript: "",
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    logo: "User Login",
    isAuthenticated: false,
    layout: "main",
    style: "loginstyle.css",
    javascript: "loginscript.js",
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie("sessionId");
    res.redirect("/login");
  });
});

app.get("/reserveSlot", isAuthenticated, (req, res) => {
  const userData = req.session.user;
  res.render("reserveSlot", {
    title: "Reserve Slot",
    logo: "Reserve Slot",
    isAuthenticated: true,
    layout: "main",
    style: "reserveSlot.css",
    javascript: "reserveSlot.js",
    labs: ["G301", "G302", "G303A", "G303B"],
    daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    userData,
  });
});

app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const { email } = req.query;
    let userData;
    const currentUserEmail = req.session.user.email; // Current logged-in user's email

    if (email) {
      const response = await fetch(
        `http://localhost:3000/api/userProfileOther?email=${email}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile for email: ${email}`);
      }

      userData = await response.json();
    } else {
      userData = req.session.user;
    }

    res.render("profile", {
      title: "Profile",
      logo: "Profile",
      isAuthenticated: true,
      layout: "main",
      style: "profile.css",
      javascript: "profile.js",
      userData,
      isOwnProfile: currentUserEmail === userData.email,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/editReservation", isAuthenticated, (req, res) => {
  res.render("editReservation", {
    title: "Edit Reservation",
    logo: "Edit Reservation",
    isAuthenticated: true,
    layout: "main",
    style: "editReservation.css",
    javascript: "editReservation.js",
  });
});

app.get("/replaceBooking", isAuthenticated, (req, res) => {
  const {
    seatNumber,
    labNumber,
    bookingDate,
    timeslot,
    bookerEmail,
    bookerName,
  } = req.query;

  const userData = req.session.user;

  res.render("replaceBooking", {
    title: "t Reservation",
    logo: "Edit Reservation",
    isAuthenticated: true,
    layout: "main",
    style: "replaceBooking.css",
    javascript: "replaceBooking.js",
    labs: ["G301", "G302", "G303A", "G303B"],
    daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    userData,
    reservationData: {
      seatNumber,
      labNumber,
      bookingDate,
      timeslot,
      bookerEmail,
      bookerName,
    },
  });
});

// Initialize database and start the server
async function initialize() {
  try {
    await populateLaboratory(); // Ensure database is populated
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error during initialization:", err);
    process.exit(1); // Exit the process with an error code
  }
}

initialize();
