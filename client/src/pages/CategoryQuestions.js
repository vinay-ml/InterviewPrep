import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetAllQuestionsQuery,
  useDeleteQuestionMutation,
  useDeleteImageMutation,
  useAddQuestionMutation,
} from '../redux/api/QuestionsApi';
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
import QuestionCard from '../components/QuestionCard';
import AddQuestionModal from '../components/AddQuestionModal';
import {
  getRequestErrorMessage,
  OFFLINE_WRITE_MESSAGE,
  readStoredJwt,
  useOnline,
} from '../utils/offline';

const CategoryQuestions = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const { currentData, isLoading, error, isFetching, refetch } = useGetAllQuestionsQuery(category);
  const online = useOnline();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [addQuestion] = useAddQuestionMutation();
  const [openModal, setOpenModal] = useState(false);

  const token = readStoredJwt();
  let accessCodePrefix = '';

  if (token) {
    try {
      accessCodePrefix = jwtDecode(token)?.accessCode?.slice(0, 2) || '';
    } catch (err) {
      console.error('Invalid token:', err);
    }
  }

  const disableAddAction = accessCodePrefix === 'CN';

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
    await deleteQuestion(id).unwrap();
  };

  const handleDeleteImage = async ({ id, imageUrl }) => {
    await deleteImage({ id, imageUrl }).unwrap();
  };

  const handleCheckboxChange = (type) => {
    setSelectedQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const questions = Array.isArray(currentData?.data) ? currentData.data : [];
  const filteredQuestions = questions.filter(
    (question) => selectedQuestionTypes[question.questionType]
  );
  const hasQuestions = Array.isArray(currentData?.data);

  // --- URL update with filteredQuestions length ---
  useEffect(() => {
    if (category && hasQuestions) {
      navigate(`/${category}?${filteredQuestions.length}`, { replace: true });
    }
  }, [category, filteredQuestions.length, hasQuestions, navigate]);
  // ------------------------------------------------

  if ((isLoading || isFetching) && !hasQuestions) {
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

  if (!hasQuestions) {
    return (
      <Box sx={{ maxWidth: 560, mx: 'auto', mt: 8, px: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          {getRequestErrorMessage(error, 'Unable to load questions.')}
        </Typography>
        <Button variant="outlined" onClick={() => refetch()}>
          Try again
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          py: 1,
          px: 0,
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', lg: 'min(100%, 1000px)' },
            mx: 'auto',
            minWidth: 0,
            boxSizing: 'border-box',
            px: { xs: 1.5, sm: 2, md: 3, lg: 3, xl: 3.5 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              columnGap: 2,
              rowGap: 1.5,
              marginBottom: '10px',
              marginTop: '10px',
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenModal(true)}
              disabled={disableAddAction || !online}
              title={online ? undefined : OFFLINE_WRITE_MESSAGE}
            >
              {isMobile ? '+ Add' : `+ Add ${category} interview question`}
            </Button>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
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

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              px: 0,
              py: { xs: 2, md: 2 },
              minWidth: 0,
              width: '100%',
            }}
          >
            {filteredQuestions?.map((question, index) => (
              <Box key={question._id} sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
                <QuestionCard
                  question={question}
                  onDelete={handleDeleteQuestion}
                  onDeleteImage={handleDeleteImage}
                  index={index}
                />
              </Box>
            ))}
          </Box>
        </Box>

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
