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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const QuestionCard = ({ question, onDelete, onDeleteImage, index }) => {
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  const hasAnswers =
    question.answers && question.answers.some((ans) => ans.trim() !== "");

  return (
    <>
      <Card elevation={8} sx={{ borderRadius: "10px", overflow: "hidden" }}>
        <CardContent>
          <Typography variant="h5">
            {`Q${index + 1}: ${question.title}`}
          </Typography>

          {hasAnswers && (
            <List>
              {question.answers.map(
                (answer, i) =>
                  answer.trim() && (
                    <ListItem key={i} sx={{ paddingLeft: "16px" }}>
                      {`• ${answer}`}
                    </ListItem>
                  )
              )}
            </List>
          )}

          {question.sampleCode && question.sampleCode.trim() && (
            <>
              <Typography
                variant="body2"
                gutterBottom
                sx={{ marginTop: "10px" }}
              >
                Code:
              </Typography>
              <SyntaxHighlighter
                language="javascript"
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
            </>
          )}

          {question.videoURL && question.videoURL.trim() && (
            <Typography
              variant="body1"
              gutterBottom
              sx={{ marginTop: "20px", marginBottom: "20px" }}
            >
              Reference Link:{" "}
              <a
                href={question.videoURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {question.videoURL}
              </a>
            </Typography>
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
                <img
                  src={image}
                  alt={`Visual representation for question ${index + 1}`}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    objectFit: "cover",
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                  }}
                  onClick={() => handleOpenDialog(image)}
                  disabled={deletingImageId === image || confirmingDelete}
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
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button variant="outlined" color="primary" size="small">
              Update Question
            </Button>
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
          </div>
        </CardContent>
      </Card>

      <Backdrop
        sx={{
          color: "#fff",
          backdropFilter: "blur(5px)",
        }}
        open={openDialog}
      >
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="delete-confirmation-dialog"
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "10px",
              elevation: 8,
            },
          }}
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
    </>
  );
};

export default QuestionCard;
