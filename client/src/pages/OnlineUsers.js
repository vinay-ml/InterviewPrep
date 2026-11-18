import React, { useEffect, useState } from 'react';
import { Avatar, Tooltip, Box, Badge, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import io from 'socket.io-client';

const socketUrl =
  window.location.hostname === 'job-interview-prep.vercel.app'
    ? 'https://job-interview-prep.vercel.app'
    : `http://${window.location.hostname}:4000`;

let socket = null;
try {
  socket = io(socketUrl, {
    autoConnect: typeof navigator === 'undefined' ? true : navigator.onLine,
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 8000,
  });
  socket.on('connect_error', () => {});
} catch (error) {
  console.error('Live presence is unavailable', error);
}

// ✅ Styled green dot badge
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    borderRadius: '50%',
    height: 12,
    minWidth: 12,
    top: 0,
    right: 0,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const OnlineUsers = ({ username }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (!socket || !username) return undefined;

    const announce = () => {
      socket.emit('user-online', { username });
    };

    if (socket.connected) announce();
    socket.on('connect', announce);
    socket.on('online-users', (users) => {
      if (Array.isArray(users)) setOnlineUsers(users);
    });

    return () => {
      socket.off('connect', announce);
      socket.off('online-users');
    };
  }, [username]);

  useEffect(() => {
    if (!socket) return undefined;

    const connect = () => {
      if (!socket.connected) socket.connect();
    };
    const disconnect = () => {
      socket.disconnect();
      setOnlineUsers([]);
    };

    window.addEventListener('online', connect);
    window.addEventListener('offline', disconnect);
    return () => {
      window.removeEventListener('online', connect);
      window.removeEventListener('offline', disconnect);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 50,
        right: 12,
        zIndex: 9999,
        display: 'flex',
        gap: 0.5,
        flexDirection: 'row',
      }}
    >
      {onlineUsers.map((user, index) => (
        <Tooltip title={user} arrow key={index}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: '50%',
              p: 0.4,
              cursor: 'pointer',
            }}
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              variant="dot"
            >
              <Avatar
                sx={{
                  width: 26,
                  height: 26,
                  fontSize: '0.75rem',
                  bgcolor: 'transparent',
                  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                }}
              >
                {user.slice(0, 2).toUpperCase()}
              </Avatar>
            </StyledBadge>
          </Paper>
        </Tooltip>
      ))}
    </Box>
  );
};

export default OnlineUsers;
