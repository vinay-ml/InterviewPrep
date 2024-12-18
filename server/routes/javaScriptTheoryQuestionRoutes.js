const express = require("express");
const {
  addJavaScriptTheoryQuestion,
  updateJavaScriptTheoryQuestion,
  deleteJavaScriptTheoryQuestion,
  deleteJavaScriptTheoryQuestionImage,
  getAllJavaScriptTheoryQuestions,
} = require("../controllers/JavascriptTheoryQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all Questions
router.get("/all", getAllJavaScriptTheoryQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addJavaScriptTheoryQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateJavaScriptTheoryQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteJavaScriptTheoryQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteJavaScriptTheoryQuestion);

module.exports = router;
