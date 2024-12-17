const mongoose = require("mongoose");

const PythonQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  answers: { type: [String], required: true },
  sampleCode: { type: String },
  image: { type: String }, // Image URL path
  videoURL: { type: String },
});

module.exports = mongoose.model("PythonQuestion", PythonQuestionSchema);
