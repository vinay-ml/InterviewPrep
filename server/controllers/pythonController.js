const PythonQuestion = require("../models/PythonQuestion");

// Get all Python questions
exports.getAllPythonQuestions = async (req, res) => {
  try {
    const questions = await PythonQuestion.find();
    res
      .status(200)
      .json({
        message: "All Python questions retrieved successfully",
        data: questions,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching questions", error: error.message });
  }
};

// Add a new Python question
exports.addPythonQuestion = async (req, res) => {
  try {
    const { title, answers, sampleCode, videoURL } = req.body;
    const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
    const image = req.file
      ? `${serverUrl}/assets/python/${req.file.filename}`
      : null;

    const newQuestion = new PythonQuestion({
      title,
      answers: answers.split(","),
      sampleCode,
      image,
      videoURL,
    });

    await newQuestion.save();
    res.status(201).json({
      message: "Python question added successfully",
      data: newQuestion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding question", error: error.message });
  }
};

// Update a Python question
exports.updatePythonQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Question ID from URL params
    const { title, answers, sampleCode, videoURL } = req.body;

    let updateData = {
      title,
      answers: answers ? answers.split(",") : undefined,
      sampleCode,
      videoURL,
    };

    // If a new image is uploaded
    if (req.file) {
      const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
      updateData.image = `${serverUrl}/assets/python/${req.file.filename}`;
    }

    const updatedQuestion = await PythonQuestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Python question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating question", error: error.message });
  }
};

// Delete a Python question
exports.deletePythonQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Question ID from URL params

    const deletedQuestion = await PythonQuestion.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Python question deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};
