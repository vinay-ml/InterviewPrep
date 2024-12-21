const mongoose = require("mongoose");

const QuestionsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  answers: { type: [String], required: true },
  sampleCode: { type: String },
  images: { type: [String], default: [] },
  referenceURLs: { type: [String], default: [] },
  questionType: { type: String, enum: ["coding", "theory"], required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Questions", QuestionsSchema);
