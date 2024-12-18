const express = require("express");
const {
  addPythonCodingQuestion,
  updatePythonCodingQuestion,
  deletePythonCodingQuestion,
  deletePythonCodingQuestionImage,
  getAllPythonCodingQuestions,
} = require("../controllers/PythonCodingQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllPythonCodingQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addPythonCodingQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updatePythonCodingQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deletePythonCodingQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deletePythonCodingQuestion);

module.exports = router;
