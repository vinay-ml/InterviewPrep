const express = require("express");
const {
  addPythonQuestion,
  updatePythonQuestion,
  deletePythonQuestion,
  getAllPythonQuestions,
} = require("../controllers/pythonController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get all questions
router.get("/all", getAllPythonQuestions);

// Add a new question
router.post("/add", upload.single("image"), addPythonQuestion);

// Update an existing question
router.put("/update/:id", upload.single("image"), updatePythonQuestion);

// Delete a question
router.delete("/delete/:id", deletePythonQuestion);

module.exports = router;
