import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

const AddQuestionModal = ({
  open,
  onClose,
  onSubmit,
  technology,
  initialData = {
    title: "",
    answers: "",
    sampleCode: "",
    referenceURLs: "",
    questionType: "",
    images: [],
  },
}) => {
  const [formData, setFormData] = useState(initialData);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Generate previews for images
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formattedData = new FormData();
    formattedData.append("title", formData.title);
    formattedData.append("answers", formData.answers);
    formattedData.append("sampleCode", formData.sampleCode);
    formattedData.append("referenceURLs", formData.referenceURLs);
    formattedData.append("questionType", formData.questionType);
    formattedData.append("category", technology);
    formData.images.forEach((image) => formattedData.append("images", image));

    try {
      await onSubmit(formattedData);
      toast.success("Question added successfully!");
      setFormData(initialData);
      setImagePreviews([]);
      onClose(); // Close modal after success
    } catch (error) {
      toast.error("Failed to add question. Please try again.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 1301,
            }}
          >
            <CircularProgress />
            <Typography
              variant="body1"
              sx={{ marginTop: "16px", color: "gray", textAlign: "center" }}
            >
              Saving your question... Please wait!
            </Typography>
          </Box>
        )}
        <DialogTitle>Add New {technology} Question</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Question Title */}
            <TextField
              label="Question Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />

            {/* Answers */}
            <TextField
              label="Answers (Dot-separated)"
              name="answers"
              value={formData.answers}
              onChange={handleInputChange}
              required
            />

            {/* Sample Code */}
            <TextField
              label="Sample Code"
              name="sampleCode"
              value={formData.sampleCode}
              onChange={handleInputChange}
              multiline
              rows={4}
            />

            {/* Reference URLs */}
            <TextField
              label="Reference URLs (Comma-separated)"
              name="referenceURLs"
              value={formData.referenceURLs}
              onChange={handleInputChange}
            />

            {/* Question Type */}
            <FormControl fullWidth>
              <InputLabel id="question-type-label">Question Type</InputLabel>
              <Select
                labelId="question-type-label"
                name="questionType"
                value={formData.questionType}
                onChange={handleInputChange}
                required
              >
                <MenuItem value="coding">Coding</MenuItem>
                <MenuItem value="theory">Theory</MenuItem>
              </Select>
            </FormControl>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <Grid container spacing={1} sx={{ marginTop: "10px" }}>
                {imagePreviews.map((preview, index) => (
                  <Grid item xs={2} key={index}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "100%",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                          },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Upload Images */}
            <Button
              variant="outlined"
              component="label"
              sx={{ marginTop: "10px" }}
            >
              Upload Images
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={
              !formData.title ||
              !formData.answers ||
              !formData.questionType ||
              loading
            }
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddQuestionModal;
