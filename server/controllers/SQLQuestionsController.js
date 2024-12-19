const SQLQuestions = require("../models/SQLQuestions");
const cloudinary = require("../config/cloudinaryConfig");
const { getCloudinaryPublicId } = require("../utils/cloudinaryUtils");

// ** Get All Questions **
exports.getAllSQLQuestions = async (req, res) => {
  try {
    const questions = await SQLQuestions.find();
    res.status(200).json({
      message: "All SQL questions retrieved successfully",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching questions",
      error: error.message,
    });
  }
};

// ** Add a New Question **
exports.addSQLQuestion = async (req, res) => {
  try {
    const { title, answers, sampleCode, videoURL } = req.body;

    // Upload images to Cloudinary and store their URLs
    const images = req.files ? req.files.map((file) => file.path) : [];

    const newQuestion = new SQLQuestions({
      title,
      answers: answers.split(","),
      sampleCode,
      images,
      videoURL,
    });

    await newQuestion.save();
    res.status(201).json({
      message: "SQL question added successfully",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding question",
      error: error.message,
    });
  }
};

// ** Update an Existing Question **
exports.updateSQLQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, answers, sampleCode, videoURL } = req.body;

    const question = await SQLQuestions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the fields
    question.title = title || question.title;
    question.answers = answers ? answers.split(",") : question.answers;
    question.sampleCode = sampleCode || question.sampleCode;
    question.videoURL = videoURL || question.videoURL;

    // If new images are uploaded, delete old ones and replace them
    if (req.files && req.files.length > 0) {
      for (const imageUrl of question.images) {
        const publicId = getCloudinaryPublicId(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }

      // Upload new images
      question.images = req.files.map((file) => file.path);
    }

    await question.save();
    res.status(200).json({
      message: "SQL question updated successfully",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating question",
      error: error.message,
    });
  }
};

// ** Delete a Specific Image from a Question **
exports.deleteSQLQuestionImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.body;

    const question = await SQLQuestions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question.images.includes(imageUrl)) {
      return res
        .status(404)
        .json({ message: "Image not found in this question" });
    }

    const publicId = getCloudinaryPublicId(imageUrl);
    if (publicId) await cloudinary.uploader.destroy(publicId);

    // Remove the image from the MongoDB array
    question.images = question.images.filter((img) => img !== imageUrl);
    await question.save();

    res.status(200).json({
      message: "Image deleted successfully",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting image",
      error: error.message,
    });
  }
};

// ** Delete a Question and its Images **
exports.deleteSQLQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await SQLQuestions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete all associated images in Cloudinary
    for (const imageUrl of question.images) {
      const publicId = getCloudinaryPublicId(imageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // Delete the question from MongoDB
    await SQLQuestions.findByIdAndDelete(id);

    res.status(200).json({
      message: "Question and associated images deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting question",
      error: error.message,
    });
  }
};
