import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PostAddIcon from '@mui/icons-material/PostAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAddQuestionMutation, useUpdateQuestionMutation } from '../redux/api/QuestionsApi';
import { getRequestErrorMessage } from '../utils/offline';
import useLanguage from '../hooks/useLanguage';
import RichTextEditor from './RichTextEditor';
import {
  answersToEditorHtml,
  serializeAnswersForApi,
  coalesceQuestionType,
  QUESTION_TYPES,
} from '../utils/richText';

const inputFieldStyles = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    color: '#f3f4f6',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid #3b82f6',
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.5)',
    '&.Mui-focused': {
      color: '#3b82f6',
    },
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
};

const GlassCard = ({ children, sx, ...props }) => (
  <Box
    sx={{
      background: 'rgba(22, 27, 34, 0.45)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      p: 3,
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
);

const ImagePreviewCard = ({ src, onRemove }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <img
        src={src}
        alt="Uploaded reference"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0, 0, 0, 0.4)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton
          onClick={onRemove}
          sx={{
            color: '#ef4444',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              bgcolor: '#ffffff',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const getFileExtension = (tech) => {
  const t = String(tech || '')
    .toLowerCase()
    .trim();
  if (t.includes('javascript') || t === 'js' || t.includes('react')) return 'js';
  if (t.includes('typescript') || t === 'ts') return 'ts';
  if (t.includes('python') || t === 'py') return 'py';
  if (t.includes('bash') || t === 'shell' || t === 'sh') return 'sh';
  if (t.includes('css')) return 'css';
  if (t.includes('html')) return 'html';
  if (t.includes('sql')) return 'sql';
  if (t.includes('yaml') || t === 'yml') return 'yml';
  return 'js';
};

const EMPTY_FORM = {
  title: '',
  answers: '',
  sampleCode: '',
  referenceURLs: '',
  questionType: '',
  images: [],
};

function normalizeFormShape(data) {
  const d = data || EMPTY_FORM;
  const hasPersistedId = d._id != null && String(d._id).trim() !== '';
  const questionType = hasPersistedId
    ? coalesceQuestionType(d)
    : QUESTION_TYPES.includes(d.questionType)
      ? d.questionType
      : '';
  return {
    title: d.title ?? '',
    answers: answersToEditorHtml(d.answers),
    sampleCode: d.sampleCode ?? '',
    referenceURLs: Array.isArray(d.referenceURLs)
      ? d.referenceURLs.filter(Boolean).join(',')
      : (d.referenceURLs ?? ''),
    questionType,
    images: Array.isArray(d.images) ? [...d.images] : [],
  };
}

const AddQuestionModal = ({
  open,
  onClose,
  technology,
  mode = 'add',
  initialData = {
    title: '',
    answers: '',
    sampleCode: '',
    referenceURLs: '',
    questionType: '',
    images: [],
  },
  questionId = null,
  accessCodePrefix,
}) => {
  const [formData, setFormData] = useState(() => normalizeFormShape(initialData));
  const [imagePreviews, setImagePreviews] = useState(() =>
    (initialData.images || []).map((img) =>
      typeof img === 'string'
        ? { src: img, isUploaded: true }
        : { src: URL.createObjectURL(img), file: img, isUploaded: false }
    )
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [addQuestion] = useAddQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const language = useLanguage();

  useEffect(() => {
    if (!open) return;

    setFormData(normalizeFormShape(initialData));

    const imgs = initialData.images || [];
    setImagePreviews(
      imgs.map((img) =>
        typeof img === 'string'
          ? { src: img, isUploaded: true }
          : {
              src: URL.createObjectURL(img),
              file: img,
              isUploaded: false,
            }
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resync on open / question identity / server fields that affect inferred type and stored answers
  }, [
    open,
    questionId,
    initialData._id,
    mode,
    initialData.questionType,
    initialData.sampleCode,
    initialData.answers,
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Generate previews for new images
    const previews = files.map((file) => ({
      src: URL.createObjectURL(file),
      file,
      isUploaded: false,
    }));

    setImagePreviews((prev) => [...prev, ...previews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = imagePreviews[index];

    // Remove the image from previews and formData
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (!imageToRemove.isUploaded) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formattedData = new FormData();
    formattedData.append('title', formData.title);
    formattedData.append('answers', serializeAnswersForApi(formData.answers));
    formattedData.append('sampleCode', formData.sampleCode);
    formattedData.append('referenceURLs', formData.referenceURLs);
    formattedData.append('questionType', formData.questionType);
    formattedData.append('category', technology);

    // Include new images in the formData
    formData.images.forEach((image) => {
      if (image instanceof File) {
        formattedData.append('images', image);
      }
    });

    try {
      if (mode === 'add') {
        await addQuestion(formattedData).unwrap();
        toast.success('Question added successfully!');
      } else if (mode === 'update' && questionId) {
        await updateQuestion({ id: questionId, formData: formattedData }).unwrap();
        toast.success('Question updated successfully!');
      } else {
        throw new Error('This question could not be saved.');
      }
      setFormData(EMPTY_FORM);
      setImagePreviews([]);
      onClose(); // Close modal after success
    } catch (error) {
      toast.error(getRequestErrorMessage(error, 'Unable to save this question. Please try again.'));
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          backgroundColor: '#090d16',
          backgroundImage:
            'radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.12) 0, transparent 50%), radial-gradient(at 50% 0%, rgba(124, 58, 237, 0.08) 0, transparent 50%)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          m: 0,
        },
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(9, 13, 22, 0.8)',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={50} thickness={4} sx={{ color: '#3b82f6' }} />
          <Typography variant="h6" sx={{ marginTop: '24px', color: '#f3f4f6', fontWeight: 600 }}>
            {mode === 'add' ? 'Saving your question...' : 'Updating your question...'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 1 }}>
            Please do not close this window
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {mode === 'add' ? (
            <PostAddIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          ) : (
            <EditNoteIcon sx={{ color: '#a78bfa', fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f3f4f6', lineHeight: 1.2 }}>
              {mode === 'add' ? 'Add Interview Question' : 'Edit Question Details'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Developer workspace dashboard for composing content
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 0.25,
              borderRadius: '20px',
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              color: '#a78bfa',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              ml: 1,
            }}
          >
            {technology}
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
            transition: 'all 0.2s',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
        <Grid container spacing={3}>
          {/* Section 1: Metadata Configuration (Full Width) */}
          <Grid item xs={12}>
            <GlassCard>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#3b82f6',
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                Metadata Configuration
              </Typography>

              <FormControl fullWidth sx={inputFieldStyles}>
                <InputLabel id="question-type-label">Question Type</InputLabel>
                <Select
                  labelId="question-type-label"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  required
                  label="Question Type"
                >
                  <MenuItem value="coding">Coding question</MenuItem>
                  <MenuItem value="theory">Theory question</MenuItem>
                  {accessCodePrefix === 'AD' && <MenuItem value="notes">Notes</MenuItem>}
                </Select>
              </FormControl>

              <TextField
                label="Question Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
                fullWidth
                sx={inputFieldStyles}
                placeholder="e.g. Explain Closure in Javascript and write a sample counter function."
              />
            </GlassCard>
          </Grid>

          {/* Section 2: Rich Answers & Notes (Full Width) */}
          <Grid item xs={12}>
            <GlassCard>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#10b981',
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                Rich Answers & Notes Content
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 1.5, color: 'rgba(255, 255, 255, 0.4)' }}
              >
                Compose structured descriptions, bullet points, headers, or formatted tables.
              </Typography>
              <Box
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  '& .ProseMirror': {
                    minHeight: '280px',
                    color: '#f3f4f6',
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <RichTextEditor
                  key={`${open}-${questionId || 'new'}-${String(initialData._id || '')}`}
                  value={formData.answers}
                  onChange={(html) => setFormData((prev) => ({ ...prev, answers: html }))}
                  disabled={loading}
                  placeholder="Paste your composition here. Formatting is completely preserved."
                />
              </Box>
            </GlassCard>
          </Grid>

          {/* Section 3: Code Editor Terminal (Full Width) */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#161b22',
                  px: 2,
                  py: 1.5,
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderBottom: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                  </Box>
                  <Box
                    sx={{
                      ml: 2,
                      px: 1.5,
                      py: 0.25,
                      borderRadius: '6px 6px 0 0',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      borderBottom: '2px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 14, color: '#60a5fa' }} />
                    <Typography
                      variant="caption"
                      sx={{ color: '#e5e7eb', fontFamily: 'monospace', fontWeight: 600 }}
                    >
                      solution.{getFileExtension(technology)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'monospace' }}
                >
                  UTF-8
                </Typography>
              </Box>

              <TextField
                name="sampleCode"
                value={formData.sampleCode}
                onChange={handleInputChange}
                multiline
                rows={10}
                placeholder="// Paste sample code directly here..."
                fullWidth
                InputProps={{
                  style: {
                    background: '#0d1117',
                    color: '#c9d1d9',
                    fontFamily:
                      'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    padding: '16px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    '& fieldset': { border: 'none' },
                    '&:hover': { border: '1px solid rgba(255, 255, 255, 0.15)' },
                    '&.Mui-focused': { border: '1px solid #3b82f6' },
                  },
                }}
              />

              {formData.sampleCode.trim() && (
                <Box sx={{ marginTop: '16px', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: 'rgba(22, 27, 34, 0.5)',
                      px: 2,
                      py: 1,
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderBottom: 'none',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}
                    >
                      Code Syntax Preview
                    </Typography>
                  </Box>
                  <SyntaxHighlighter
                    language={language}
                    style={dracula}
                    customStyle={{
                      background: '#0d1117',
                      color: '#c9d1d9',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '16px',
                      fontSize: '13px',
                      overflowX: 'auto',
                      margin: 0,
                    }}
                  >
                    {formData.sampleCode}
                  </SyntaxHighlighter>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Section 4: External Assets & Reference Links (Full Width at the End) */}
          <Grid item xs={12}>
            <GlassCard>
              <Typography
                variant="subtitle2"
                sx={{
                  color: '#fbbf24',
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                External Assets & Reference Links
              </Typography>

              <TextField
                label="Reference URLs (comma separated)"
                name="referenceURLs"
                value={formData.referenceURLs}
                onChange={handleInputChange}
                placeholder="https://example.com, https://react.dev"
                fullWidth
                sx={inputFieldStyles}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ color: 'rgba(255, 255, 255, 0.3)', mr: 1 }} />,
                }}
              />

              {imagePreviews.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 1,
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: 600,
                    }}
                  >
                    Attached Reference Previews ({imagePreviews.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {imagePreviews.map((preview, index) => (
                      <Grid item xs={4} sm={3} key={index}>
                        <ImagePreviewCard
                          src={preview.src}
                          onRemove={() => handleRemoveImage(index)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  color: '#60a5fa',
                  borderColor: 'rgba(96, 165, 250, 0.3)',
                  borderRadius: '10px',
                  px: 2.5,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 650,
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#60a5fa',
                    background: 'rgba(96, 165, 250, 0.05)',
                    boxShadow: '0 0 12px rgba(96, 165, 250, 0.15)',
                  },
                }}
              >
                Upload Reference Images
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </GlassCard>
          </Grid>
        </Grid>
      </DialogContent>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          px: 4,
          py: 2.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            px: 3,
            py: 1.25,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              color: '#ffffff',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
            transition: 'all 0.2s',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title.trim() || !formData.questionType || loading}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            px: 4,
            py: 1.25,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 650,
            transition: 'all 0.3s ease',
            '&:disabled': {
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.25)',
              boxShadow: 'none',
            },
            '&:hover': {
              background: 'linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {mode === 'add' ? 'Create Question' : 'Save Changes'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AddQuestionModal;
