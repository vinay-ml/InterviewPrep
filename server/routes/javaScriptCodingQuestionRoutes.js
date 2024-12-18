const express = require("express");
const {
  addJavaScriptCodingQuestion,
  updateJavaScriptCodingQuestion,
  deleteJavaScriptCodingQuestion,
  deleteJavaScriptCodingQuestionImage,
  getAllJavaScriptCodingQuestions,
} = require("../controllers/JavascriptCodingQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all Questions
router.get("/all", getAllJavaScriptCodingQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addJavaScriptCodingQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateJavaScriptCodingQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteJavaScriptCodingQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteJavaScriptCodingQuestion);

module.exports = router;
