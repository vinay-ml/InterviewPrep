import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { jwtDecode } from "jwt-decode";
import { useTheme } from "@mui/material/styles";
import QuestionCard from "../components/QuestionCard";
import AddQuestionModal from "../components/AddQuestionModal";
import OnlineUsers from "./OnlineUsers";

const CategoryQuestions = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, isFetching } =
    useGetAllQuestionsQuery(category);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [addQuestion] = useAddQuestionMutation();
  const [openModal, setOpenModal] = useState(false);

  const token = localStorage.getItem("token");
  let decoded = {};
  let accessCodePrefix = "";

  if (token) {
    try {
      decoded = jwtDecode(token);
      const accessCode = decoded?.accessCode || "";
      accessCodePrefix = accessCode.slice(0, 2);
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  const username = decoded?.username || "Guest";

  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({
    coding: true,
    theory: true,
    notes: true,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    setSelectedQuestionTypes({
      coding: true,
      theory: true,
      notes: true,
    });
  }, [category]);

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

  // --- URL update with filteredQuestions length ---
  useEffect(() => {
    if (category && filteredQuestions) {
      navigate(`/${category}?${filteredQuestions.length}`, { replace: true });
    }
  }, [category, filteredQuestions?.length, navigate]);
  // ------------------------------------------------

  if (isFetching || isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#e0e0e0 ",
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
    <>
      {accessCodePrefix !== "CN" && accessCodePrefix !== "MB" ? (
        <Box sx={{ p: 1, backgroundColor: "#e0e0e0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenModal(true)}
            >
              {isMobile ? "+ Add" : `+ Add ${category} interview question`}
            </Button>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 0, mr: -1 }}>
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedQuestionTypes.notes}
                      onChange={() => handleCheckboxChange("notes")}
                      color="primary"
                    />
                  }
                  label="Notes"
                />
              </Box>
            </Box>
          </Box>

          <Grid
            container
            spacing={5}
            sx={{
              p: { xs: 0, md: 3 },
              pt: { xs: 2, md: 3 },
            }}
          >
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

          <AddQuestionModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            onSubmit={handleAddQuestion}
            technology={category}
            accessCodePrefix={accessCodePrefix}
          />
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            color: "#d32f2f",
            fontWeight: "bold",
            fontFamily: "monospace",
            margin: "40px auto",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Error Code: <span style={{ color: "#b71c1c" }}>MONGODB-509</span>
          </Typography>
          <Typography variant="body1" sx={{ mt: -1 }}>
            Cluster not available. Free tier M0 storage limit exceeded
          </Typography>
        </Box>
      )}
    </>
  );
};

export default CategoryQuestions;
