import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

const AddQuestionModal = ({
  open,
  onClose,
  onSubmit,
  technology,
  initialData = {
    title: "",
    answers: "",
    sampleCode: "",
    videoURL: "",
    images: [],
  },
}) => {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };

  const handleSubmit = () => {
    const formattedData = new FormData();
    formattedData.append("title", formData.title);
    formattedData.append("answers", formData.answers);
    formattedData.append("sampleCode", formData.sampleCode);
    formattedData.append("videoURL", formData.videoURL);
    formData.images.forEach((image) => formattedData.append("images", image));

    onSubmit(formattedData);
    setFormData(initialData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add New {technology} Theory Question</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Question Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <TextField
            label="Answers (Comma-separated)"
            name="answers"
            value={formData.answers}
            onChange={handleInputChange}
            required
          />

          <TextField
            label="Sample Code"
            name="sampleCode"
            value={formData.sampleCode}
            onChange={handleInputChange}
            multiline
            rows={4}
          />

          <TextField
            label="Video URL"
            name="videoURL"
            value={formData.videoURL}
            onChange={handleInputChange}
          />

          <Button
            variant="outlined"
            component="label"
            sx={{ marginTop: "10px" }}
          >
            Upload Images
            <input
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
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!formData.title || !formData.answers}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionModal;
