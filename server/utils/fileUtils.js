const fs = require("fs");
const path = require("path");

// Delete File Function
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File deleted: ${filePath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err.message);
  }
};

module.exports = { deleteFile };
