import React from "react";
import {
  useGetAllQuestionsQuery,
  useDeleteQuestionMutation,
  useDeleteImageMutation,
} from "../redux/api/javascriptTheoryQuestionsApi";
import { Grid, Typography, Box, CircularProgress } from "@mui/material";
import QuestionCard from "../components/QuestionCard";

const JavaScriptTheoryPage = () => {
  const { data, isLoading, error } = useGetAllQuestionsQuery();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();

  // Function to delete a question
  const handleDeleteQuestion = async (id) => {
    await deleteQuestion(id);
  };

  // Function to delete an image
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
      <Typography variant="h4" gutterBottom sx={{ marginBottom: "20px" }}>
        {`JavaScript Theory Questions: ${data?.data?.length}`}
      </Typography>
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
    </Box>
  );
};

export default JavaScriptTheoryPage;
