import React, { useState } from "react";
import {
  useGetAllQuestionsQuery,
  useDeleteQuestionMutation,
  useDeleteImageMutation,
  useAddQuestionMutation,
} from "../redux/api/javascriptTheoryQuestionsApi";
import { Grid, Typography, Box, CircularProgress, Button } from "@mui/material";
import QuestionCard from "../components/QuestionCard";
import AddQuestionModal from "../components/AddQuestionModal";

const JavaScriptTheoryPage = () => {
  const { data, isLoading, error } = useGetAllQuestionsQuery();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [addQuestion] = useAddQuestionMutation();

  const [openModal, setOpenModal] = useState(false);

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
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" gutterBottom sx={{ marginBottom: "20px" }}>
          {`${
            data?.data?.length > 0
              ? `JavaScript Theory Questions: ${data?.data?.length}`
              : "JavaScript Theory Questions: Coming soon"
          }`}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          sx={{ marginBottom: "20px" }}
        >
          + Add JavaScript Theory Interview Question
        </Button>
      </Box>
      <Grid container spacing={5}>
        {data?.data.map((question, index) => (
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

      {/* Reusable Modal */}
      <AddQuestionModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddQuestion}
        technology="JavaScript"
      />
    </Box>
  );
};

export default JavaScriptTheoryPage;
