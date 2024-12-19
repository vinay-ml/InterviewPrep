const express = require("express");
const {
  getAllPowerBIQuestions,
  addPowerBIQuestion,
  updatePowerBIQuestion,
  deletePowerBIQuestionImage,
  deletePowerBIQuestion,
} = require("../controllers/PowerBIQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllPowerBIQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addPowerBIQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updatePowerBIQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deletePowerBIQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deletePowerBIQuestion);

module.exports = router;
