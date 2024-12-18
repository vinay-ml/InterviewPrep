const express = require("express");
const {
  addPythonQuestion,
  updatePythonQuestion,
  deletePythonQuestion,
  getAllPythonQuestions,
  deleteImage,
} = require("../controllers/pythonController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all questions
router.get("/all", getAllPythonQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addPythonQuestion);

// Update an existing question (multiple images allowed)
router.put("/update/:id", uploadMultiple, updatePythonQuestion);

// Delete a specific image
router.delete("/delete-image", deleteImage);

// Delete a question
router.delete("/delete/:id", deletePythonQuestion);

module.exports = router;
