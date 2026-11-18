import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  List,
  ListItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
  Backdrop,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';
import AddQuestionModal from './AddQuestionModal';
import useLanguage from '../hooks/useLanguage';
import {
  looksLikeHtml,
  parseAnswersFromApi,
  answerSegmentIsRenderable,
  hasRenderableAnswersFromApi,
  visibleTextFromAnswerHtml,
} from '../utils/richText';
import RichAnswerHtml from './RichAnswerHtml';
import { getRequestErrorMessage, readStoredJwt, useOnline } from '../utils/offline';

const readAccessCodePrefix = () => {
  try {
    const jwt = readStoredJwt();
    if (!jwt) return '';
    return jwtDecode(jwt)?.accessCode?.slice(0, 2) || '';
  } catch (error) {
    return '';
  }
};

const QuestionCard = ({ question, onDelete, onDeleteImage, index, onUpdate }) => {
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImage, setShowImage] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const online = useOnline();
  const location = useLocation();
  const language = useLanguage();
  const accessCodePrefix = readAccessCodePrefix();
  const disableManageActions = !online || accessCodePrefix === 'CN' || accessCodePrefix === 'MB';

  const handleConfirmDelete = async () => {
    setConfirmingDelete(true);
    try {
      if (deleteTarget === 'question') {
        setDeletingQuestion(true);
        await onDelete(question._id);
        toast.success('Question deleted');
      } else if (deleteTarget) {
        setDeletingImageId(deleteTarget);
        await onDeleteImage({
          id: question._id,
          imageUrl: deleteTarget,
        });
        toast.success('Image deleted');
      }
      setOpenDialog(false);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to delete. Please try again.'));
    } finally {
      setConfirmingDelete(false);
      setDeletingQuestion(false);
      setDeletingImageId('');
    }
  };

  const handleOpenDialog = (target) => {
    setDeleteTarget(target);
    setOpenDialog(true);
  };

  const handleOpenUpdateModal = () => {
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const handleUpdate = async (updatedData) => {
    await onUpdate({ id: question._id, ...updatedData });
    setUpdateModalOpen(false);
  };

  const answerSlices = parseAnswersFromApi(question.answers);
  const hasRenderableAnswers = hasRenderableAnswersFromApi(question.answers);
  const getAnswerCollapseSize = (answer) => {
    if (!answerSegmentIsRenderable(answer)) return 0;
    const visibleTextLength = visibleTextFromAnswerHtml(answer).length;
    const rawHtmlLength = looksLikeHtml(answer) ? String(answer).trim().length : 0;
    return Math.max(visibleTextLength, rawHtmlLength);
  };
  const answerTextLength = answerSlices.reduce((sum, ans) => sum + getAnswerCollapseSize(ans), 0);
  const shouldCollapseAnswer = answerTextLength > 1100;
  const canShowAnswerContent = !shouldCollapseAnswer || showAnswer;

  return (
    <Paper
      elevation={24}
      sx={{
        borderRadius: '12px',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        boxShadow: 'none',
        border: 'none',
        backdropFilter: 'none',
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
        '&:hover': {
          transform: 'translateY(-6px) translateZ(0) scale(1.008)',
          '& .main-question-card': {
            borderColor: 'rgba(59, 130, 246, 0.35)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.55), 0 0 25px rgba(59, 130, 246, 0.15)',
          },
        },
      }}
    >
      <Card
        className="main-question-card"
        elevation={8}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'rgba(22, 27, 34, 0.65)',
          maxWidth: '100%',
          minWidth: 0,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <CardContent>
          <Typography
            sx={{
              color: '#ffffff',
              fontSize: { xs: '1.05rem', sm: '1.15rem', md: '1.35rem' },
              fontWeight: 700,
              letterSpacing: '-0.015em',
              lineHeight: 1.4,
            }}
          >
            Q{index + 1}: {question.title}
          </Typography>

          {hasRenderableAnswers && (
            <Box sx={{ marginTop: '12px' }}>
              {shouldCollapseAnswer && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowAnswer((prev) => !prev)}
                  sx={{ marginBottom: canShowAnswerContent ? '10px' : 0 }}
                >
                  {showAnswer ? 'Hide answer' : 'Show answer'}
                </Button>
              )}
              {canShowAnswerContent &&
                answerSlices.map(
                  (answer, i) =>
                    answerSegmentIsRenderable(answer) &&
                    (looksLikeHtml(answer) ? (
                      <RichAnswerHtml key={i} html={answer} />
                    ) : (
                      <List
                        key={i}
                        component="ul"
                        sx={{
                          listStyleType: 'disc',
                          paddingLeft: { xs: '16px', sm: '24px', md: '28px' },
                        }}
                      >
                        <ListItem
                          component="li"
                          sx={{
                            display: 'list-item',
                            paddingLeft: '0px',
                            fontSize: { xs: '0.95rem', sm: '1rem', md: '1.2rem' },
                          }}
                        >
                          <Typography component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                            {answer}
                          </Typography>
                        </ListItem>
                      </List>
                    ))
                )}
              {shouldCollapseAnswer && showAnswer && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setShowAnswer(false)}
                  sx={{ marginTop: '10px' }}
                >
                  Hide answer
                </Button>
              )}
            </Box>
          )}

          {question.sampleCode && question.sampleCode.trim() && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowCode((prev) => !prev)}
                sx={{ marginTop: '10px' }}
              >
                {showCode ? 'Hide code' : 'Show code'}
              </Button>
              {showCode && (
                <Box
                  sx={{
                    mt: 1,
                    maxWidth: '100%',
                    minWidth: 0,
                    overflowX: 'auto',
                    borderRadius: '5px',
                  }}
                >
                  <SyntaxHighlighter
                    language={language}
                    style={dracula}
                    customStyle={{
                      background: '#1e1e1e',
                      color: '#d4d4d4',
                      borderRadius: '5px',
                      padding: '20px',
                      fontSize: '14px',
                      margin: 0,
                      overflowX: 'auto',
                      maxWidth: '100%',
                    }}
                  >
                    {question.sampleCode}
                  </SyntaxHighlighter>
                </Box>
              )}
            </>
          )}

          {question.referenceURLs && question.referenceURLs.some((url) => url.trim() !== '') && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}
              >
                Reference Links:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {question.referenceURLs.map((url, i) => {
                  if (!url.trim()) return null;
                  let hostname = url;
                  try {
                    hostname = new URL(url).hostname.replace('www.', '');
                  } catch (e) {}
                  return (
                    <Button
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontSize: '0.78rem',
                        py: 0.4,
                        px: 1.5,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        color: '#93c5fd',
                        backdropFilter: 'blur(4px)',
                        '&:hover': {
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      🔗 {hostname}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}

          {question.images &&
            question.images.length > 0 &&
            question.images.map((image, i) => (
              <Box
                key={i}
                sx={{
                  position: 'relative',
                  marginTop: '20px',
                  marginBottom: '20px',
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowImage((prev) => ({ ...prev, [image]: !prev[image] }))}
                  sx={{ marginBottom: '10px' }}
                >
                  {showImage[image] ? 'Hide Image' : 'Show Me Image'}
                </Button>
                {showImage[image] && !imageErrors[image] && (
                  <img
                    src={image}
                    alt={`Visual representation for question ${index + 1}`}
                    style={{
                      width: '100%',
                      borderRadius: '5px',
                      objectFit: 'cover',
                    }}
                    onError={() => setImageErrors((prev) => ({ ...prev, [image]: true }))}
                  />
                )}
                {showImage[image] && imageErrors[image] && (
                  <Typography variant="body2" color="error">
                    {online
                      ? 'This image could not be loaded.'
                      : 'This image is not saved on this device. Show it once while you are online.'}
                  </Typography>
                )}
                <IconButton
                  sx={{ position: 'absolute', top: 5, right: 5 }}
                  onClick={() => handleOpenDialog(image)}
                  disabled={disableManageActions || deletingImageId === image || confirmingDelete}
                >
                  {deletingImageId === image ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon color="error" />
                  )}
                </IconButton>
              </Box>
            ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={handleOpenUpdateModal}
              disabled={disableManageActions}
            >
              Update Question
            </Button>
            <IconButton
              color="secondary"
              onClick={() => handleOpenDialog('question')}
              disabled={disableManageActions || deletingQuestion || confirmingDelete}
            >
              {deletingQuestion ? <CircularProgress size={20} /> : <DeleteIcon />}
            </IconButton>
          </div>
        </CardContent>
      </Card>

      <Backdrop sx={{ color: 'common.white', backdropFilter: 'blur(5px)' }} open={openDialog}>
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="delete-confirmation-dialog"
          sx={{ '& .MuiDialog-paper': { borderRadius: '10px', elevation: 8 } }}
        >
          <DialogTitle id="delete-confirmation-dialog">
            Are you sure you want to delete this{' '}
            {deleteTarget === 'question' ? 'question' : 'image'}?
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() => setOpenDialog(false)}
              color="primary"
              disabled={confirmingDelete}
            >
              No
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              autoFocus
              disabled={confirmingDelete}
              startIcon={confirmingDelete && <CircularProgress size={20} />}
            >
              {confirmingDelete ? '' : 'Yes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>

      {/* Update Question Modal */}
      <AddQuestionModal
        open={updateModalOpen}
        onClose={handleCloseUpdateModal}
        onSubmit={handleUpdate}
        technology={location.pathname.split('-')[0].replace('/', '')}
        mode="update"
        questionId={question._id}
        initialData={question}
        accessCodePrefix={accessCodePrefix}
      />
    </Paper>
  );
};

export default QuestionCard;
