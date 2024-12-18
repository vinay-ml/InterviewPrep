const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./database/connectDB");
const { updateAccessCodes } = require("./controllers/authController");

const PythonTheoryQuestionRoutes = require("./routes/PythonTheoryQuestionRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Update access codes at server start
updateAccessCodes();

// Serve Static Files
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/PythonTheoryQuestions", PythonTheoryQuestionRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
