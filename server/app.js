const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./database/connectDB");
const { updateAccessCodes } = require("./controllers/authController");
const authRoutes = require("./routes/authRoutes");
const QuestionRoutes = require("./routes/QuestionRoutes");

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
app.use("/api/questions", QuestionRoutes);

// Deployment
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname1, "/client/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
} else {
  app.get("/api/test", (req, res) => {
    res.send("API is running..");
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
