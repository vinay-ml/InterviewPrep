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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

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
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          marginTop: "10px",
        }}
      >
        {/* Add Question Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
        >
          {isMobile ? "+ Add" : `+ Add ${category} interview question`}
        </Button>
        {!isMobile && (
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "primary.main",
              letterSpacing: "0.05em",
              fontSize: "24px",
              textTransform: "capitalize",
            }}
          >
            {Object.values(selectedQuestionTypes).every(
              (isSelected) => !isSelected
            )
              ? `${category} interview questions: 0`
              : filteredQuestions?.length > 0
              ? `${category} interview questions: ${filteredQuestions.length}`
              : `${category} interview questions: Coming soon`}
          </Typography>
        )}
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
            {isMobile ? "Type" : "Question Type"}:
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
              label={"Coding"}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedQuestionTypes.theory}
                  onChange={() => handleCheckboxChange("theory")}
                  color="primary"
                />
              }
              label={"Theory"}
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={5} sx={{ p: 3 }}>
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
