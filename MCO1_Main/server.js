const express = require("express");
const path = require("path");
const app = express();

// Define routes to send HTML files

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "contact.html"));
});

app.get("/reserveSlot", (req, res) => {
  res.sendFile(path.join(__dirname, "reserveSlot.html"));
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "profile.html"));
});

app.get("/editReservation", (req, res) => {
  res.sendFile(path.join(__dirname, "editReservation.html"));
});

app.use((req, res) => {
  res.status(404).send("<h1>404 Not Found</h1>");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
