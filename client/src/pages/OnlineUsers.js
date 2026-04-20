import React, { useEffect, useState } from 'react';
import { Avatar, Tooltip, Box, Badge, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import io from 'socket.io-client';

const getSocketServerUrl = () => {
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';

  return isLocalHost ? 'http://localhost:5000' : 'https://inter-view-prep.vercel.app';
};

// Connect to a single shared socket backend.
const socket = io(getSocketServerUrl(), {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

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

const OnlineUsers = ({ username, isADUser }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const theme = useTheme();
  const currentUserName = username?.trim() || 'AD User';

  useEffect(() => {
    if (!username?.trim()) return undefined;

    const emitUserOnline = () => {
      if (username?.trim()) {
        socket.emit('user-online', { username: username.trim() });
      }
    };

    socket.connect();

    socket.on('connect', () => {
      emitUserOnline();
    });

    if (socket.connected) {
      emitUserOnline();
    }

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('connect');
      socket.off('online-users');
      socket.disconnect();
    };
  }, [username]);

  if (!isADUser) {
    return null;
  }

  const displayedUsers = Array.from(new Set([currentUserName, ...onlineUsers.filter(Boolean)]));

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {displayedUsers.map((user, index) => (
        <Tooltip title={user} arrow key={index}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                fontSize: '0.75rem',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200',
                color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {user.trim().slice(0, 2).toUpperCase()}
            </Avatar>
          </StyledBadge>
        </Tooltip>
      ))}
    </Box>
  );
};

export default OnlineUsers;
