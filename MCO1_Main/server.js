const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const path = require("path");
const routes = require("./models/routes/reserveSlotServer");

// Define the view engine and path to views directory

app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", routes);

app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Information",
    logo: "Contact Information",
    isAuthenticated: false,
    layout: "main",
    style: "contact.css",
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

app.get("/reserveSlot", (req, res) => {
  res.render("reserveSlot", {
    title: "Reserve Slot",
    logo: "Reserve Slot",
    isAuthenticated: true,
    layout: "main",
    style: "reserveSlot.css",
    javascript: "reserveSlot.js",
    labs: ["G301", "G302", "G303A", "G303B"],
    daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Profile",
    logo: "Profile",
    isAuthenticated: true,
    layout: "main",
    style: "profile.css",
    javascript: "profile.js",
  });
});

app.get("/editReservation", (req, res) => {
  res.render("editReservation", {
    title: "Edit Reservation",
    logo: "Edit Reservation",
    isAuthenticated: true,
    layout: "main",
    style: "editReservation.css",
    javascript: "editReservation.js",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
