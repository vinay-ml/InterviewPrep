import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Grid,
  Collapse,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import {
  useAddNavigationSectionMutation,
  useAddNavigationTopicMutation,
  useGetNavigationConfigQuery,
  useUpdateNavigationSectionMutation,
  useUpdateNavigationTopicMutation,
  useDeleteNavigationSectionMutation,
  useDeleteNavigationTopicMutation,
} from '../redux/api/navigationApi';

const getStoredJwt = () => {
  const tokenData = localStorage.getItem('token');

  if (!tokenData) return null;

  try {
    return JSON.parse(tokenData).token;
  } catch (error) {
    return tokenData;
  }
};

const getAccessCodePrefix = () => {
  try {
    const token = getStoredJwt();
    return token ? jwtDecode(token)?.accessCode?.slice(0, 2) : '';
  } catch (error) {
    return '';
  }
};

const getLanguageBadgeColor = (lang) => {
  const formatted = String(lang || '')
    .toLowerCase()
    .trim();
  switch (formatted) {
    case 'javascript':
    case 'js':
      return { bg: 'rgba(250, 204, 21, 0.1)', text: '#fde047' }; // Yellow
    case 'python':
    case 'py':
      return { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' }; // Blue
    case 'bash':
    case 'shell':
    case 'sh':
      return { bg: 'rgba(74, 222, 128, 0.1)', text: '#86efac' }; // Green
    case 'css':
      return { bg: 'rgba(236, 72, 153, 0.1)', text: '#f472b6' }; // Pink
    case 'html':
      return { bg: 'rgba(249, 115, 22, 0.1)', text: '#ffb74d' }; // Orange
    case 'sql':
      return { bg: 'rgba(6, 182, 212, 0.1)', text: '#67e8f9' }; // Cyan
    case 'typescript':
    case 'ts':
      return { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd' }; // Light Blue
    case 'yaml':
    case 'yml':
      return { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc' }; // Purple
    default:
      return { bg: 'rgba(255, 255, 255, 0.08)', text: 'rgba(255, 255, 255, 0.7)' }; // Gray
  }
};

const AdminTopics = () => {
  const [sectionName, setSectionName] = useState('');
  const [sectionOrder, setSectionOrder] = useState('end');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [topicForm, setTopicForm] = useState({
    label: '',
    path: '',
    language: 'javascript',
    orderPosition: 'end',
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: '',
    sectionId: '',
    topicId: '',
    name: '',
  });

  const isAdmin = getAccessCodePrefix() === 'AD';
  const { data: navigationConfig, isLoading } = useGetNavigationConfigQuery();
  const apiSections = useMemo(() => navigationConfig?.data || [], [navigationConfig]);
  const selectedSection = useMemo(
    () => apiSections.find((section) => section._id === selectedSectionId),
    [apiSections, selectedSectionId]
  );

  const [addNavigationSection, { isLoading: addingSection }] = useAddNavigationSectionMutation();
  const [addNavigationTopic, { isLoading: addingTopic }] = useAddNavigationTopicMutation();
  const [updateNavigationSection, { isLoading: updatingSection }] =
    useUpdateNavigationSectionMutation();
  const [updateNavigationTopic, { isLoading: updatingTopic }] = useUpdateNavigationTopicMutation();
  const [deleteNavigationSection, { isLoading: deletingSection }] =
    useDeleteNavigationSectionMutation();
  const [deleteNavigationTopic, { isLoading: deletingTopic }] = useDeleteNavigationTopicMutation();

  // Auto-select first section when loaded
  useEffect(() => {
    if (!selectedSectionId && apiSections.length) {
      setSelectedSectionId(apiSections[0]._id);
    }
  }, [apiSections, selectedSectionId]);

  // Minimize all sections by default
  useEffect(() => {
    if (apiSections.length) {
      setExpandedSections((prev) => {
        const next = { ...prev };
        apiSections.forEach((section) => {
          if (next[section._id] === undefined) {
            next[section._id] = false;
          }
        });
        return next;
      });
    }
  }, [apiSections]);

  const totalTopicsCount = useMemo(() => {
    return apiSections.reduce((sum, sec) => sum + (sec.topics?.length || 0), 0);
  }, [apiSections]);

  const handleAddSection = async () => {
    try {
      const order = sectionOrder === 'start' ? 1 : apiSections.length + 1;
      await addNavigationSection({ category: sectionName, order }).unwrap();
      setSectionName('');
      setSectionOrder('end');
      toast.success('Section added successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to add section');
    }
  };

  const handleAddTopic = async () => {
    try {
      const order = topicForm.orderPosition === 'start' ? 1 : '';
      await addNavigationTopic({
        sectionId: selectedSectionId,
        label: topicForm.label,
        path: topicForm.path,
        language: topicForm.language,
        order,
      }).unwrap();
      setTopicForm({
        label: '',
        path: '',
        language: 'javascript',
        orderPosition: 'end',
      });
      toast.success('Topic added successfully');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to add topic');
    }
  };

  const handleMoveSection = async (sectionId, currentIndex, direction) => {
    const targetOrder = direction === 'up' ? currentIndex : currentIndex + 2;
    try {
      await updateNavigationSection({
        sectionId,
        order: targetOrder,
      }).unwrap();
      toast.success('Section reordered');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to reorder section');
    }
  };

  const handleMoveTopic = async (sectionId, topicId, currentIndex, direction) => {
    const targetOrder = direction === 'up' ? currentIndex : currentIndex + 2;
    try {
      await updateNavigationTopic({
        sectionId,
        topicId,
        order: targetOrder,
      }).unwrap();
      toast.success('Topic reordered');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to reorder topic');
    }
  };

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleDeleteSection = (sectionId, sectionName) => {
    setDeleteConfirm({
      open: true,
      type: 'section',
      sectionId,
      topicId: '',
      name: sectionName,
    });
  };

  const handleDeleteTopic = (sectionId, topicId, topicLabel) => {
    setDeleteConfirm({
      open: true,
      type: 'topic',
      sectionId,
      topicId,
      name: topicLabel,
    });
  };

  const handleConfirmDelete = async () => {
    const { type, sectionId, topicId } = deleteConfirm;
    setDeleteConfirm((prev) => ({ ...prev, open: false }));
    try {
      if (type === 'section') {
        await deleteNavigationSection(sectionId).unwrap();
        toast.success('Section deleted successfully');
        if (selectedSectionId === sectionId) {
          setSelectedSectionId('');
        }
      } else if (type === 'topic') {
        await deleteNavigationTopic({ sectionId, topicId }).unwrap();
        toast.success('Topic deleted successfully');
      }
    } catch (error) {
      toast.error(error?.data?.message || `Unable to delete ${type}`);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ maxWidth: 760, mx: 'auto', p: 3 }}>
        <Alert severity="error">Admin access is required to manage drawer topics.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        p: { xs: 1.5, sm: 2.5, md: 4 },
        pt: { xs: 6, md: 4 },
      }}
    >
      {/* Header Panel */}
      <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AdminPanelSettingsIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'primary.main' }} />
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.35rem', sm: '1.7rem', md: '2.125rem' },
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Navigation Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage navigation sections, topics, paths, and default languages for drawer menus.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Left Column: Live Navigation Hierarchy Tree */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              background: 'rgba(22, 27, 34, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: { xs: 2, md: 3 },
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Navigation Structure
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  py: 0.5,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  borderRadius: 99,
                  fontWeight: 600,
                }}
              >
                {apiSections.length} {apiSections.length === 1 ? 'Section' : 'Sections'} ·{' '}
                {totalTopicsCount} {totalTopicsCount === 1 ? 'Topic' : 'Topics'}
              </Typography>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : apiSections.length === 0 ? (
              <Alert severity="info">No sections configured. Create a new section to start.</Alert>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {apiSections.map((section, index) => (
                  <Box
                    key={section._id}
                    sx={{
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      bgcolor:
                        selectedSectionId === section._id
                          ? 'rgba(59, 130, 246, 0.02)'
                          : 'rgba(255, 255, 255, 0.01)',
                      '&:hover': {
                        borderColor: 'rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    {/* Section Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: { xs: 1.25, sm: 2 },
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleToggleSection(section._id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        {expandedSections[section._id] ? (
                          <ExpandLessIcon sx={{ color: 'text.secondary' }} />
                        ) : (
                          <ExpandMoreIcon sx={{ color: 'text.secondary' }} />
                        )}
                        <FolderIcon sx={{ color: '#fbbf24' }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 650 }} noWrap>
                            {section.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {section.topics?.length || 0}{' '}
                            {section.topics?.length === 1 ? 'topic' : 'topics'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Section Controls */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                          flexShrink: 0,
                          ml: 1,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Move Section Up">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveSection(section._id, index, 'up')}
                              disabled={index === 0 || updatingSection}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:disabled': { color: 'rgba(255, 255, 255, 0.15)' },
                              }}
                            >
                              <KeyboardArrowUpIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Move Section Down">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveSection(section._id, index, 'down')}
                              disabled={index === apiSections.length - 1 || updatingSection}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:disabled': { color: 'rgba(255, 255, 255, 0.15)' },
                              }}
                            >
                              <KeyboardArrowDownIcon />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Button
                          size="small"
                          variant={selectedSectionId === section._id ? 'contained' : 'outlined'}
                          onClick={() => setSelectedSectionId(section._id)}
                          sx={{
                            ml: { xs: 0.25, sm: 1 },
                            px: { xs: 1, sm: 1.5 },
                            py: 0.5,
                            fontSize: '0.7rem',
                            borderRadius: 1.5,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Select
                        </Button>

                        {section.questionCount === 0 && (
                          <Tooltip title="Delete Section">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSection(section._id, section.category)}
                              disabled={deletingSection}
                              sx={{
                                color: 'rgba(239, 68, 68, 0.8)',
                                '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Section Topics list */}
                    <Collapse in={expandedSections[section._id]} timeout="auto">
                      <Box
                        sx={{
                          p: { xs: 1, sm: 2 },
                          bgcolor: 'rgba(0, 0, 0, 0.12)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        {section.topics && section.topics.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {section.topics.map((topic, tIdx) => {
                              const badge = getLanguageBadgeColor(topic.language);
                              return (
                                <Box
                                  key={topic._id}
                                  sx={{
                                    display: 'flex',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    justifyContent: 'space-between',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: { xs: 1, sm: 0 },
                                    p: { xs: 1.2, sm: 1.5 },
                                    borderRadius: 1.5,
                                    border: '1px solid rgba(255, 255, 255, 0.03)',
                                    bgcolor: 'rgba(255, 255, 255, 0.01)',
                                    transition: 'all 0.15s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                                      borderColor: 'rgba(255, 255, 255, 0.08)',
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      minWidth: 0,
                                      width: '100%',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: '50%',
                                        bgcolor:
                                          selectedSectionId === section._id
                                            ? 'primary.main'
                                            : 'rgba(255, 255, 255, 0.3)',
                                        ml: 0.5,
                                        flexShrink: 0,
                                      }}
                                    />
                                    <ArticleIcon
                                      sx={{ color: 'text.secondary', fontSize: 18, flexShrink: 0 }}
                                    />
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                                        {topic.label}
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: { xs: 'flex-start', sm: 'center' },
                                          flexDirection: { xs: 'column', sm: 'row' },
                                          gap: 1,
                                          mt: 0.2,
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            maxWidth: { xs: '100%', sm: 220 },
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                        >
                                          <LinkIcon sx={{ fontSize: 12 }} /> {topic.path}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            px: 1,
                                            py: 0.1,
                                            borderRadius: 0.8,
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            bgcolor: badge.bg,
                                            color: badge.text,
                                            textTransform: 'uppercase',
                                          }}
                                        >
                                          {topic.language || 'javascript'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Topic Controls */}
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.2,
                                      alignSelf: { xs: 'flex-end', sm: 'center' },
                                    }}
                                  >
                                    <Tooltip title="Move Topic Up">
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleMoveTopic(section._id, topic._id, tIdx, 'up')
                                          }
                                          disabled={tIdx === 0 || updatingTopic}
                                          sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            '&:disabled': { color: 'rgba(255, 255, 255, 0.15)' },
                                          }}
                                        >
                                          <KeyboardArrowUpIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Move Topic Down">
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleMoveTopic(section._id, topic._id, tIdx, 'down')
                                          }
                                          disabled={
                                            tIdx === section.topics.length - 1 || updatingTopic
                                          }
                                          sx={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            '&:disabled': { color: 'rgba(255, 255, 255, 0.15)' },
                                          }}
                                        >
                                          <KeyboardArrowDownIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>

                                    {topic.questionCount === 0 && (
                                      <Tooltip title="Delete Topic">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            handleDeleteTopic(section._id, topic._id, topic.label)
                                          }
                                          disabled={deletingTopic}
                                          sx={{
                                            color: 'rgba(239, 68, 68, 0.7)',
                                            '&:hover': {
                                              color: '#ef4444',
                                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                                            },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic', pl: 2 }}
                          >
                            No topics under this section.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Creation Forms */}
        <Grid item xs={12} md={5}>
          {/* Create Section Form */}
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              mb: { xs: 2, md: 4 },
              background: 'rgba(22, 27, 34, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: { xs: 1.5, md: 2.5 } }}>
              Add New Section
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <TextField
                label="Section Name"
                value={sectionName}
                onChange={(event) => setSectionName(event.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. System Design"
              />
              <FormControl fullWidth size="small">
                <InputLabel id="section-position-label">Position</InputLabel>
                <Select
                  labelId="section-position-label"
                  label="Position"
                  value={sectionOrder}
                  onChange={(event) => setSectionOrder(event.target.value)}
                >
                  <MenuItem value="end">At the end</MenuItem>
                  <MenuItem value="start">At the beginning</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddSection}
                disabled={!sectionName.trim() || addingSection}
                startIcon={
                  addingSection ? <CircularProgress size={20} color="inherit" /> : <AddIcon />
                }
                sx={{ py: 1, fontWeight: 600, mt: 0.5, width: { xs: '100%', sm: 'auto' } }}
              >
                Add Section
              </Button>
            </Box>
          </Paper>

          {/* Create Topic Form */}
          <Paper
            sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              background: 'rgba(22, 27, 34, 0.4)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 3,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
              Add Topic
            </Typography>

            {selectedSection ? (
              <Alert
                severity="info"
                sx={{ mb: 2.5, py: 0.25, '& .MuiAlert-message': { fontSize: '0.825rem' } }}
              >
                Adding under <strong>{selectedSection.category}</strong>
              </Alert>
            ) : (
              <Alert
                severity="warning"
                sx={{ mb: 2.5, py: 0.25, '& .MuiAlert-message': { fontSize: '0.825rem' } }}
              >
                Please select a section first
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="target-section-label">Target Section</InputLabel>
                <Select
                  labelId="target-section-label"
                  label="Target Section"
                  value={selectedSectionId}
                  onChange={(event) => setSelectedSectionId(event.target.value)}
                  disabled={isLoading}
                >
                  {apiSections.map((sec) => (
                    <MenuItem key={sec._id} value={sec._id}>
                      {sec.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Topic Label"
                value={topicForm.label}
                onChange={(event) =>
                  setTopicForm((prev) => ({ ...prev, label: event.target.value }))
                }
                fullWidth
                size="small"
                placeholder="e.g. Load Balancers"
              />

              <TextField
                label="Path (optional)"
                value={topicForm.path}
                onChange={(event) =>
                  setTopicForm((prev) => ({ ...prev, path: event.target.value }))
                }
                fullWidth
                size="small"
                placeholder="e.g. /load-balancers"
              />

              <FormControl fullWidth size="small">
                <InputLabel id="topic-lang-label">Code Language</InputLabel>
                <Select
                  labelId="topic-lang-label"
                  label="Code Language"
                  value={topicForm.language}
                  onChange={(event) =>
                    setTopicForm((prev) => ({ ...prev, language: event.target.value }))
                  }
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="bash">Bash / Shell</MenuItem>
                  <MenuItem value="css">CSS</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="sql">SQL</MenuItem>
                  <MenuItem value="yaml">YAML</MenuItem>
                  <MenuItem value="markdown">Markdown</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="topic-position-label">Position</InputLabel>
                <Select
                  labelId="topic-position-label"
                  label="Position"
                  value={topicForm.orderPosition}
                  onChange={(event) =>
                    setTopicForm((prev) => ({ ...prev, orderPosition: event.target.value }))
                  }
                >
                  <MenuItem value="end">At the end</MenuItem>
                  <MenuItem value="start">At the beginning</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleAddTopic}
                disabled={!selectedSectionId || !topicForm.label.trim() || addingTopic}
                startIcon={
                  addingTopic ? <CircularProgress size={20} color="inherit" /> : <AddIcon />
                }
                sx={{ py: 1, fontWeight: 600, mt: 0.5, width: { xs: '100%', sm: 'auto' } }}
              >
                Add Topic
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))}
        PaperProps={{
          sx: {
            background: 'rgba(22, 27, 34, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            color: '#fff',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
            Are you sure you want to delete the {deleteConfirm.type}{' '}
            <strong>"{deleteConfirm.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setDeleteConfirm((prev) => ({ ...prev, open: false }))}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.15)',
              px: 2,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{
              bgcolor: '#ef4444',
              px: 2.5,
              fontWeight: 600,
              '&:hover': { bgcolor: '#dc2626' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTopics;
