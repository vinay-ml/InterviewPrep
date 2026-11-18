import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { useLoginMutation } from '../redux/api/authApi';
import { toast } from 'react-toastify';
import { getRequestErrorMessage } from '../utils/offline';

const AuthModal = ({ open, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [login] = useLoginMutation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login({ username, accessCode }).unwrap();
      toast.success('Login successful');
      onLoginSuccess();
    } catch (error) {
      toast.error(
        getRequestErrorMessage(error, 'Login failed. Check your connection and try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      maxWidth="xs"
      fullWidth
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '1.45rem',
          pt: 3,
          pb: 0.5,
          letterSpacing: '-0.025em',
          background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Welcome to InterviewPrep
      </DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <TextField
          label="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            },
          }}
        />
        <TextField
          label="Enter Access Code or Ask Vinay"
          type="password"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
            },
          }}
        />
      </DialogContent>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 3,
          pt: 1,
        }}
      >
        <Button
          variant="contained"
          onClick={handleLogin}
          color="primary"
          disabled={loading}
          fullWidth
          sx={{
            borderRadius: '10px',
            py: 1.1,
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Login'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default AuthModal;
