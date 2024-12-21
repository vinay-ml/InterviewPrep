const express = require("express");
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  deleteQuestionImage,
  getAllQuestionsByCategory,
} = require("../controllers/QuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all questions for a category
router.get("/all/:category", getAllQuestionsByCategory);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addQuestion);

// Update an existing question
router.put("/update/:id", uploadMultiple, updateQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteQuestion);

module.exports = router;
