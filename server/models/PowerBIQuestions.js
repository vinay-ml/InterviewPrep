const mongoose = require("mongoose");

const PowerBIQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  answers: { type: [String], required: true },
  sampleCode: { type: String },
  images: { type: [String], default: [] },
  videoURL: { type: String },
});

module.exports = mongoose.model("PowerBIQuestions", PowerBIQuestionSchema);
