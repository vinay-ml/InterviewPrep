const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./database/connectDB");
const { updateAccessCodes } = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");

const PythonTheoryQuestionRoutes = require("./routes/PythonTheoryQuestionRoutes");
const PythonCodingQuestionRoutes = require("./routes/PythonCodingQuestionRoutes");
const javaScriptTheoryQuestionRoutes = require("./routes/javaScriptTheoryQuestionRoutes");
const javaScriptCodingQuestionRoutes = require("./routes/javaScriptCodingQuestionRoutes");
const HTMLQuestionRoutes = require("./routes/HTMLQuestionRoutes");
const CSSQuestionRoutes = require("./routes/CSSQuestionRoutes");
const ReactJSQuestionRoutes = require("./routes/ReactJSQuestionRoutes");
const SQLQuestionRoutes = require("./routes/SQLQuestionRoutes");
const PowerBIQuestionRoutes = require("./routes/PowerBIQuestionRoutes");

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
app.use("/api/PythonCodingQuestions", PythonCodingQuestionRoutes);
app.use("/api/javaScriptTheoryQuestions", javaScriptTheoryQuestionRoutes);
app.use("/api/javaScriptCodingQuestions", javaScriptCodingQuestionRoutes);
app.use("/api/HTMLQuestions", HTMLQuestionRoutes);
app.use("/api/CSSQuestions", CSSQuestionRoutes);
app.use("/api/ReactJSQuestions", ReactJSQuestionRoutes);
app.use("/api/SQLQuestions", SQLQuestionRoutes);
app.use("/api/PowerBIQuestions", PowerBIQuestionRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
