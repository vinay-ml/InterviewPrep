const mongoose = require("mongoose");

const AccessCodeSchema = new mongoose.Schema({
  accessCode: { type: String, required: true },
  users: { type: [String], default: [] },
  lastUpdated: { type: Date, default: null },
});

module.exports = mongoose.model("AccessCode", AccessCodeSchema);
