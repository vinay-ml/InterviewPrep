const Questions = require("../models/QuestionsModel");
const cloudinary = require("../config/cloudinaryConfig");
const { getCloudinaryPublicId } = require("../utils/cloudinaryUtils");

// ** Get All Questions by Category **
exports.getAllQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await Questions.find({ category });
    res.status(200).json({
      message: `All ${category} questions retrieved successfully`,
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
exports.addQuestion = async (req, res) => {
  try {
    const {
      title,
      answers,
      sampleCode,
      referenceURLs,
      questionType,
      category,
    } = req.body;

    // Upload images to Cloudinary and store their URLs
    const images = req.files ? req.files.map((file) => file.path) : [];

    const newQuestion = new Questions({
      title,
      answers: answers.split(",,"),
      sampleCode,
      images,
      referenceURLs: referenceURLs.split(","),
      questionType,
      category,
    });

    await newQuestion.save();
    res.status(201).json({
      message: `${category} question added successfully`,
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
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, answers, sampleCode, referenceURLs, questionType } =
      req.body;

    const question = await Questions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update fields
    question.title = title || question.title;
    question.answers = answers ? answers.split(",,") : question.answers;
    question.sampleCode = sampleCode || question.sampleCode;
    question.referenceURLs = referenceURLs
      ? referenceURLs.split(",")
      : question.referenceURLs;
    question.questionType = questionType || question.questionType;

    // If new images are uploaded, add them to the existing array
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      question.images = [...question.images, ...newImages];
    }

    await question.save();
    res.status(200).json({
      message: "Question updated successfully",
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
exports.deleteQuestionImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.body;

    const question = await Questions.findById(id);
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
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Questions.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete all associated images in Cloudinary
    for (const imageUrl of question.images) {
      const publicId = getCloudinaryPublicId(imageUrl);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }

    // Delete the question from MongoDB
    await Questions.findByIdAndDelete(id);

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
