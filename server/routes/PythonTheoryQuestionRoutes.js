const express = require("express");
const {
  addPythonTheoryQuestion,
  updatePythonTheoryQuestion,
  deletePythonTheoryQuestion,
  deletePythonTheoryQuestionImage,
  getAllPythonTheoryQuestions,
} = require("../controllers/PythonTheoryQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllPythonTheoryQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addPythonTheoryQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updatePythonTheoryQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deletePythonTheoryQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deletePythonTheoryQuestion);

module.exports = router;
