const express = require("express");
const {
  getAllSQLQuestions,
  addSQLQuestion,
  updateSQLQuestion,
  deleteSQLQuestionImage,
  deleteSQLQuestion,
} = require("../controllers/SQLQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllSQLQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addSQLQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateSQLQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteSQLQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteSQLQuestion);

module.exports = router;
