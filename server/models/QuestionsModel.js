const mongoose = require('mongoose');

const QuestionsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  answers: { type: [String] },
  sampleCode: { type: String },
  /** Prism/react-syntax-highlighter language id for sampleCode (optional; fallback: category mapping). */
  sampleCodeLanguage: { type: String, default: null },
  images: { type: [String], default: [] },
  referenceURLs: { type: [String], default: [] },
  questionType: {
    type: String,
    enum: ['coding', 'theory', 'notes'],
    required: true,
  },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Questions', QuestionsSchema);
