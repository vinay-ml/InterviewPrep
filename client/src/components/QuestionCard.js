import React, { useState } from "react";
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
  Skeleton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import AddQuestionModal from "./AddQuestionModal";
import useLanguage from "../hooks/useLanguage";

const QuestionCard = ({
  question,
  onDelete,
  onDeleteImage,
  index,
  onUpdate,
}) => {
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showImage, setShowImage] = useState({});

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const accessCode = decoded?.accessCode || "";
  const accessCodePrefix = accessCode.slice(0, 2);

  const location = useLocation();
  const language = useLanguage();

  const handleConfirmDelete = async () => {
    setConfirmingDelete(true);
    if (deleteTarget === "question") {
      setDeletingQuestion(true);
      await onDelete(question._id);
      setDeletingQuestion(false);
    } else if (deleteTarget) {
      setDeletingImageId(deleteTarget);
      await onDeleteImage({
        id: question._id,
        imageUrl: deleteTarget,
      });
      setDeletingImageId("");
    }
    setConfirmingDelete(false);
    setOpenDialog(false);
    setDeleteTarget(null);
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

  const hasAnswers =
    question.answers && question.answers.some((ans) => ans.trim() !== "");

  return (
    <Paper elevation={24} sx={{ borderRadius: "10px" }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#e0e0e0",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ opacity: "90%" }}>
            Q{index + 1}: {question.title}
          </Typography>

          {hasAnswers && (
            <List>
              {question.answers.map(
                (answer, i) =>
                  answer.trim() && (
                    <ListItem
                      key={i}
                      sx={{
                        paddingLeft: "16px",
                        fontSize: "18px",
                      }}
                    >
                      • {answer}
                    </ListItem>
                  )
              )}
            </List>
          )}
          {question.sampleCode && question.sampleCode.trim() && (
            <>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowCode((prev) => !prev)}
                sx={{ marginTop: "10px" }}
              >
                {showCode ? "Hide Code" : "Show Me Code"}
              </Button>
              {showCode && (
                <SyntaxHighlighter
                  language={language}
                  style={dracula}
                  customStyle={{
                    background: "#1e1e1e",
                    color: "#d4d4d4",
                    borderRadius: "5px",
                    padding: "20px",
                    fontSize: "14px",
                    overflowX: "auto",
                  }}
                >
                  {question.sampleCode}
                </SyntaxHighlighter>
              )}
            </>
          )}

          {question.referenceURLs &&
            question.referenceURLs.some((url) => url.trim() !== "") && (
              <>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", marginTop: "10px" }}
                >
                  Reference Links:
                </Typography>
                {question.referenceURLs.map(
                  (url, i) =>
                    url.trim() && (
                      <Typography
                        key={i}
                        variant="body1"
                        gutterBottom
                        sx={{ marginTop: "5px" }}
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {url}
                        </a>
                      </Typography>
                    )
                )}
              </>
            )}

          {question.images &&
            question.images.length > 0 &&
            question.images.map((image, i) => (
              <Box
                key={i}
                sx={{
                  position: "relative",
                  marginTop: "20px",
                  marginBottom: "20px",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    setShowImage((prev) => ({ ...prev, [image]: !prev[image] }))
                  }
                  sx={{ marginBottom: "10px" }}
                >
                  {showImage[image] ? "Hide Image" : "Show Me Image"}
                </Button>
                {showImage[image] && (
                  <img
                    src={image}
                    alt={`Visual representation for question ${index + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: "5px",
                      objectFit: "cover",
                    }}
                    onLoad={() =>
                      setImageLoaded((prev) => ({
                        ...prev,
                        [image]: true,
                      }))
                    }
                  />
                )}
                {accessCodePrefix !== "CN" && accessCodePrefix !== "MB" && (
                  <IconButton
                    sx={{ position: "absolute", top: 5, right: 5 }}
                    onClick={() => handleOpenDialog(image)}
                    disabled={deletingImageId === image || confirmingDelete}
                  >
                    {deletingImageId === image ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DeleteIcon color="error" />
                    )}
                  </IconButton>
                )}
              </Box>
            ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            {accessCodePrefix !== "CN" && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleOpenUpdateModal}
              >
                Update Question
              </Button>
            )}
            {accessCodePrefix !== "CN" && accessCodePrefix !== "MB" && (
              <IconButton
                color="secondary"
                onClick={() => handleOpenDialog("question")}
                disabled={deletingQuestion || confirmingDelete}
              >
                {deletingQuestion ? (
                  <CircularProgress size={20} />
                ) : (
                  <DeleteIcon />
                )}
              </IconButton>
            )}
          </div>
        </CardContent>
      </Card>

      <Backdrop
        sx={{ color: "#fff", backdropFilter: "blur(5px)" }}
        open={openDialog}
      >
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="delete-confirmation-dialog"
          sx={{ "& .MuiDialog-paper": { borderRadius: "10px", elevation: 8 } }}
        >
          <DialogTitle id="delete-confirmation-dialog">
            Are you sure you want to delete this{" "}
            {deleteTarget === "question" ? "question" : "image"}?
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
              {confirmingDelete ? "" : "Yes"}
            </Button>
          </DialogActions>
        </Dialog>
      </Backdrop>

      {/* Update Question Modal */}
      <AddQuestionModal
        open={updateModalOpen}
        onClose={handleCloseUpdateModal}
        onSubmit={handleUpdate}
        technology={location.pathname.split("-")[0].replace("/", "")}
        mode="update"
        questionId={question._id}
        initialData={question}
      />
    </Paper>
  );
};

export default QuestionCard;
