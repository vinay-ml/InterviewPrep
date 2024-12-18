const express = require("express");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");
const {
  getAllCSSQuestions,
  addCSSQuestion,
  updateCSSQuestion,
  deleteCSSQuestionImage,
  deleteCSSQuestion,
} = require("../controllers/CSSQuestionsController");

const router = express.Router();

// Get all Questions
router.get("/all", getAllCSSQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addCSSQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateCSSQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteCSSQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteCSSQuestion);

module.exports = router;
