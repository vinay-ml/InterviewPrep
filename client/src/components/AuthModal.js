import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Access Code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleLogin} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Login"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthModal;
