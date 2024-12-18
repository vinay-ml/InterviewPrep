const jwt = require("jsonwebtoken");
const AccessCode = require("../models/AccessCode");

// Update Access Codes at Application Startup
exports.updateAccessCodes = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if codes are already updated for today
    const existingCode = await AccessCode.findOne({
      lastUpdated: { $gte: today },
    });
    if (existingCode) {
      console.log("Access codes are already updated for today.");
      return;
    }

    // Fetch existing access codes
    const codes = await AccessCode.find();

    if (!codes.length) {
      console.log("No access codes found in the database.");
      return;
    }

    // Append today's date to the existing access codes
    const day = new Date().getDate().toString().padStart(2, "0");
    for (const code of codes) {
      code.accessCode = `${code.accessCode.slice(0, -2)}${day}`;
      code.lastUpdated = today;
      await code.save();
    }

    console.log("Access codes updated successfully for today.");
  } catch (error) {
    console.error("Error updating access codes:", error.message);
  }
};

// Verify Access Code, Track Username, and Generate JWT
exports.login = async (req, res) => {
  try {
    const { accessCode, username } = req.body;

    // Validate input
    if (!accessCode || !username) {
      return res
        .status(400)
        .json({ message: "Access code and username are required" });
    }

    // Check for valid access code
    const codeEntry = await AccessCode.findOne({ accessCode });
    if (!codeEntry) {
      return res.status(401).json({ message: "Invalid access code" });
    }

    // Check if username already exists
    if (!codeEntry.users.includes(username)) {
      // Add new username if it doesn't exist
      codeEntry.users.push(username);
      await codeEntry.save();
    }

    // Generate JWT Token (Expires in 60 days)
    const token = jwt.sign(
      { id: codeEntry._id, accessCode: codeEntry.accessCode, username },
      process.env.JWT_SECRET,
      { expiresIn: "60d" }
    );

    res.status(200).json({ message: "Access granted", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
