const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./database/connectDB");
const { updateAccessCodes } = require("./controllers/authController");

const pythonRoutes = require("./routes/pythonRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Serve Static Files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/python", pythonRoutes);

// Update access codes at server start
updateAccessCodes();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
