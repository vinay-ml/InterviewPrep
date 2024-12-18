const fs = require("fs");
const path = require("path");
const PythonQuestion = require("../models/PythonQuestion");
const { deleteFile } = require("../utils/fileUtils");

// Helper Function to Resolve File Path
const resolveFilePath = (imageUrl) => {
  return path.join(
    __dirname,
    "..",
    imageUrl.replace(`${process.env.SERVER_URL || "http://localhost:5000"}`, "")
  );
};

// Get all Python questions
exports.getAllPythonQuestions = async (req, res) => {
  try {
    const questions = await PythonQuestion.find();
    res.status(200).json({
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

    // Collect all uploaded image URLs
    const images = req.files
      ? req.files.map((file) => `${serverUrl}/assets/python/${file.filename}`)
      : [];

    const newQuestion = new PythonQuestion({
      title,
      answers: answers.split(","),
      sampleCode,
      images,
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
    const { id } = req.params;
    const { title, answers, sampleCode, videoURL } = req.body;

    let updateData = {
      title,
      answers: answers ? answers.split(",") : undefined,
      sampleCode,
      videoURL,
    };

    // Handle new images if uploaded
    if (req.files) {
      const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
      const newImages = req.files.map(
        (file) => `${serverUrl}/assets/python/${file.filename}`
      );
      updateData.images = newImages;
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

// Delete a Python question and its images
exports.deletePythonQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await PythonQuestion.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete all associated images
    if (question.images && question.images.length > 0) {
      question.images.forEach((imageUrl) => {
        const filePath = resolveFilePath(imageUrl);
        deleteFile(filePath);
      });
    }

    // Delete the question
    await PythonQuestion.findByIdAndDelete(id);

    res.status(200).json({
      message: "Python question and associated images deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting question", error: error.message });
  }
};

// Delete a specific image from a question
exports.deleteImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.body;

    const question = await PythonQuestion.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if the image exists in the question
    if (!question.images.includes(imageUrl)) {
      return res
        .status(404)
        .json({ message: "Image not found in this question" });
    }

    // Remove the image from the images array
    question.images = question.images.filter((img) => img !== imageUrl);
    await question.save();

    // Delete the file from the assets folder
    const filePath = resolveFilePath(imageUrl);
    deleteFile(filePath);

    res
      .status(200)
      .json({ message: "Image deleted successfully", data: question });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};
