const express = require("express");
const {
  addHTMLQuestion,
  updateHTMLQuestion,
  deleteHTMLQuestion,
  deleteHTMLQuestionImage,
  getAllHTMLQuestions,
} = require("../controllers/HTMLQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllHTMLQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addHTMLQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateHTMLQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteHTMLQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteHTMLQuestion);

module.exports = router;
