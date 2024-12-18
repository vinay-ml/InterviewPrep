const express = require("express");
const {
  addPythonQuestion,
  updatePythonQuestion,
  deletePythonQuestion,
  deleteImage,
  getAllPythonQuestions,
} = require("../controllers/pythonController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all questions
router.get("/all", getAllPythonQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addPythonQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updatePythonQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteImage);

// Delete a question and its images
router.delete("/delete/:id", deletePythonQuestion);

module.exports = router;
