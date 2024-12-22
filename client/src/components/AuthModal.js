import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { useLoginMutation } from "../redux/api/authApi";
import { toast } from "react-toastify";

const AuthModal = ({ open, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({ username, accessCode }).unwrap();
      toast.success("Login successful");
      onLoginSuccess();
    } catch (error) {
      toast.error(error?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      maxWidth="sm"
      fullWidth
      BackdropProps={{
        sx: {
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <DialogContent>
        <TextField
          label="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Enter Access Code or Ask Vinay"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleLogin}
          color="primary"
          disabled={loading}
          sx={{ minWidth: "100px" }}
        >
          {loading ? <CircularProgress size={20} /> : "Login"}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AuthModal;
