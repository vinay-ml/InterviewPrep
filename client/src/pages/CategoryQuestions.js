import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAllQuestionsQuery,
  useDeleteQuestionMutation,
  useDeleteImageMutation,
  useAddQuestionMutation,
} from '../redux/api/QuestionsApi';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import QuestionCard from '../components/QuestionCard';
import AddQuestionModal from '../components/AddQuestionModal';
import { getDecodedAuthToken } from '../utils/authToken';

const CategoryQuestions = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, isFetching } = useGetAllQuestionsQuery(category);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [addQuestion] = useAddQuestionMutation();
  const [openModal, setOpenModal] = useState(false);

  const decoded = getDecodedAuthToken();
  const accessCode = (decoded?.accessCode || '').toUpperCase();
  const accessCodePrefix = accessCode.slice(0, 2);

  const username = decoded?.username || 'Guest';
  const isCNUser = accessCodePrefix === 'CN';

  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({
    coding: true,
    theory: true,
    notes: true,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
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
      <Box sx={{ p: 1, backgroundColor: (theme) => theme.palette.background.default }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            marginTop: '10px',
          }}
        >
          {!isCNUser ? (
            <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
              {isMobile ? '+ Add' : `+ Add ${category} interview question`}
            </Button>
          ) : (
            <Box />
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', gap: 0, mr: -1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedQuestionTypes.coding}
                    onChange={() => handleCheckboxChange('coding')}
                    color="primary"
                  />
                }
                label="Coding"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedQuestionTypes.theory}
                    onChange={() => handleCheckboxChange('theory')}
                    color="primary"
                  />
                }
                label="Theory"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedQuestionTypes.notes}
                    onChange={() => handleCheckboxChange('notes')}
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
    </>
  );
};

export default CategoryQuestions;
