import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import OnlineUsers from '../pages/OnlineUsers';
import { getDecodedAuthToken } from '../utils/authToken';

const Navbar = () => {
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const decoded = getDecodedAuthToken();

  const username = decoded?.username || '';
  const accessCode = (decoded?.accessCode || '').toUpperCase();
  const accessCodePrefix = accessCode.slice(0, 2);
  const isADUser = accessCodePrefix === 'AD';

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: 'JavaScript', to: '/javascript' },
    { text: 'ReactJS', to: '/reactjs' },
    { text: 'HTML', to: '/html' },
    { text: 'CSS', to: '/css' },
    { text: 'NodeJS', to: '/nodejs' },
    { text: 'SQL', to: '/sql' },
    { text: 'MongoDB vs Sequelize', to: '/MongoDB_Sequelize' },
    { text: 'Elastic || Open search', to: '/Elastic||Open search' },
    { text: 'Redis ', to: '/redis ' },
    { text: 'RabbitMQ ', to: '/rabbitMQ ' },
    { text: 'Kafka ', to: '/kafka ' },
    { text: 'Python', to: '/python' },
    { text: 'GenAI with PY', to: '/GenAI with PY' },
    { text: 'GenAI with JS', to: '/GenAI with JS' },
    { text: 'Docker', to: '/docker' },
    { text: 'Kubernetes', to: '/kubernetes' },
    { text: 'Jenkins', to: '/jenkins' },
    { text: 'AWS for hosting', to: '/aws for hosting' },
    { text: 'System design', to: '/system design' },
    { text: 'PowerBI', to: '/powerbi' },
    { text: 'Miscellaneous', to: '/miscellaneous' },
  ];

  // Path and current section extraction
  const pathName = location.pathname;
  const pathSegments = pathName.replace(/^\/+|\/+$/g, '').split('/');
  const currentSection =
    pathSegments.length > 0 && pathSegments[0] !== '' ? pathSegments[pathSegments.length - 1] : '';

  const capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Query param (number)
  const questionCount = location.search ? location.search.replace('?', '') : '';

  // Immediate navigation handler for both AppBar and Drawer
  const handleNavLinkClick = (to) => (event) => {
    event.preventDefault();
    navigate(to, { replace: true });
    setDrawerOpen(false); // For mobile drawer
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          zIndex: 1300,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'space-between',
        }}
      >
        <Toolbar>
          {/* AppBar navigation links */}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}
            component="div"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            <NavLink
              to="/"
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              onClick={handleNavLinkClick('/')}
            >
              InterviewPrep
            </NavLink>
            {/* Only display the badge if query param (questionCount) exists */}

            {currentSection && questionCount && (
              <Typography
                variant="h6"
                component="span"
                sx={{
                  ml: 1,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: 'primary.contrastText',
                  bgcolor: 'primary.dark',
                  px: 1,
                  borderRadius: '6px',
                }}
              >
                / {capitalizeFirstLetter(decodeURIComponent(currentSection))}: {questionCount}
              </Typography>
            )}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OnlineUsers username={username} isADUser={isADUser} />
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
          },
        }}
      >
        <Box role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <Typography
            variant="h6"
            sx={{
              padding: '16px',
              textAlign: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            Navigation
          </Typography>
          <Divider />
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton
                  component="a"
                  href={link.to}
                  onClick={handleNavLinkClick(link.to)}
                  sx={{
                    '&.active': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
