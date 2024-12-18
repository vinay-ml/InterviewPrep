const getCloudinaryPublicId = (imageUrl) => {
  try {
    // Extract everything after "upload/"
    const urlParts = imageUrl.split("upload/");
    if (urlParts.length < 2) {
      console.error("Invalid Cloudinary URL format:", imageUrl);
      return null;
    }

    // Remove the version prefix and extension
    const publicIdWithExt = urlParts[1]
      .split("/")
      .slice(1)
      .join("/")
      .split(".")[0];
    return publicIdWithExt;
  } catch (error) {
    console.error("Error extracting Public ID:", error.message);
    return null;
  }
};

module.exports = { getCloudinaryPublicId };
