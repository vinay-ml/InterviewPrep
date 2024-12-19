const express = require("express");
const {
  getAllReactJSQuestions,
  addReactJSQuestion,
  updateReactJSQuestion,
  deleteReactJSQuestionImage,
  deleteReactJSQuestion,
} = require("../controllers/ReactJSQuestionsController");
const { uploadMultiple } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all PythonTheoryQuestions
router.get("/all", getAllReactJSQuestions);

// Add a new question with multiple images
router.post("/add", uploadMultiple, addReactJSQuestion);

// Update an existing question (replace or add images)
router.put("/update/:id", uploadMultiple, updateReactJSQuestion);

// Delete a specific image from a question
router.delete("/delete-image", deleteReactJSQuestionImage);

// Delete a question and its images
router.delete("/delete/:id", deleteReactJSQuestion);

module.exports = router;
