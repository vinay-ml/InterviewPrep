const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./database/connectDB");
const pythonRoutes = require("./routes/pythonRoutes");

dotenv.config({ path: "./config/config.env" });
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Serve Static Files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Routes
app.use("/api/python", pythonRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("InterviewPrep Backend API is running");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
