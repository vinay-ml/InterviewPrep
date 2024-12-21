import React, { useState } from "react";
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
    referenceURLs: "",
    questionType: "",
    images: [],
  },
}) => {
  const [formData, setFormData] = useState(initialData);

  console.log(technology);

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
    formattedData.append("referenceURLs", formData.referenceURLs);
    formattedData.append("questionType", formData.questionType);
    formattedData.append("category", technology);
    formData.images.forEach((image) => formattedData.append("images", image));

    onSubmit(formattedData);
    setFormData(initialData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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

          {/* Upload Images */}
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
          disabled={
            !formData.title || !formData.answers || !formData.questionType
          }
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddQuestionModal;
