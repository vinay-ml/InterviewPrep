import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useGetAllQuestionsQuery,
  useDeleteQuestionMutation,
  useDeleteImageMutation,
  useAddQuestionMutation,
} from "../redux/api/QuestionsApi";
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import AddQuestionModal from "../components/AddQuestionModal";

const Javascript = () => {
  const location = useLocation();
  const category = location.pathname.split("-")[0].replace("/", "");

  const { data, isLoading, error } = useGetAllQuestionsQuery(category);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [addQuestion] = useAddQuestionMutation();

  const [openModal, setOpenModal] = useState(false);

  // State to manage selected question types
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({
    coding: true,
    theory: true,
  });

  const handleAddQuestion = async (formData) => {
    await addQuestion(formData);
    setOpenModal(false);
  };

  const handleDeleteQuestion = async (id) => {
    await deleteQuestion(id);
  };

  const handleDeleteImage = async ({ id, imageUrl }) => {
    await deleteImage({ id, imageUrl });
  };

  const handleCheckboxChange = (type) => {
    setSelectedQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const filteredQuestions = data?.data.filter(
    (question) => selectedQuestionTypes[question.questionType]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 4 }}>
        Error: {error.message}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {filteredQuestions?.length > 0
            ? `${category} interview questions: ${filteredQuestions.length}`
            : `${category} interview questions: Coming soon`}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            alignItems: "center",
          }}
        >
          {/* Label for Question Type */}
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            Question Type:
          </Typography>
          {/* Checkboxes for filtering */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedQuestionTypes.coding}
                  onChange={() => handleCheckboxChange("coding")}
                  color="primary"
                />
              }
              label="Coding"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedQuestionTypes.theory}
                  onChange={() => handleCheckboxChange("theory")}
                  color="primary"
                />
              }
              label="Theory"
            />
          </Box>
        </Box>
        {/* Add Question Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
        >
          + Add {category} interview question
        </Button>
      </Box>

      <Grid container spacing={5}>
        {filteredQuestions?.map((question, index) => (
          <Grid item xs={12} md={12} key={question._id}>
            <QuestionCard
              question={question}
              onDelete={handleDeleteQuestion}
              onDeleteImage={handleDeleteImage}
              index={index}
            />
          </Grid>
        ))}
      </Grid>

      {/* Add Question Modal */}
      <AddQuestionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddQuestion}
        technology={category}
      />
    </Box>
  );
};

export default Javascript;
