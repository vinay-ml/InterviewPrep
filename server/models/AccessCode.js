const mongoose = require("mongoose");

const AccessCodeSchema = new mongoose.Schema({
  accessCode: { type: String, required: true },
  users: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AccessCode", AccessCodeSchema);
