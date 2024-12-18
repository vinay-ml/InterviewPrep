const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");
const { v4: uuidv4 } = require("uuid");

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let category = req.body.category || "general";
    category = category.toLowerCase();

    return {
      folder: `InterviewPrep/${category}`, // Organized under InterviewPrep/category
      format: file.originalname.split(".").pop(), // Retain file format
      public_id: uuidv4(), // Unique identifier
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = {
  uploadMultiple: upload.array("images", 8),
};
