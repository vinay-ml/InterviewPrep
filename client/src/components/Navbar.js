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
  CircularProgress,
  Button,
  Dialog,
  DialogContent,
  Tooltip,
} from '@mui/material';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useGetNavigationConfigQuery } from '../redux/api/navigationApi';
import AdminTopics from '../pages/AdminTopics';
import { getRequestErrorMessage } from '../utils/offline';

const getTopicPath = (topic) => topic.path || `/${topic.label.trim().toLowerCase()}`;

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

const Navbar = () => {
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const navigate = useNavigate();
  const {
    data: navigationConfig,
    error: navigationError,
    isLoading: navigationLoading,
    isFetching: navigationFetching,
    refetch: refetchNavigation,
  } = useGetNavigationConfigQuery();
  const navSections = navigationConfig?.data || [];
  const hasNavSections = navSections.length > 0;
  const showNavigationLoading = (navigationLoading || navigationFetching) && !hasNavSections;
  const showNavigationError = navigationError && !hasNavSections;
  const isAdmin = getAccessCodePrefix() === 'AD';

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
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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

          {isAdmin && (
            <Tooltip title="Admin">
              <IconButton
                color="inherit"
                onClick={() => setAdminOpen(true)}
                sx={{
                  mr: 1,
                  color: '#90caf9',
                  backgroundColor: 'rgba(144, 202, 249, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.16)',
                  },
                }}
              >
                <AdminPanelSettingsIcon />
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            color="inherit"
            edge="end"
            aria-label="open topic drawer"
            data-topic-drawer-button="true"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
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
              background:
                'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              color: '#ffffff',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 700,
            }}
          >
            Navigation
          </Typography>
          <Divider />
          <List sx={{ py: 1, px: 1 }}>
            {showNavigationLoading && (
              <Box
                sx={{
                  mx: 0.75,
                  my: 1.2,
                  px: 1.5,
                  py: 1.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(144, 202, 249, 0.08)',
                  border: '1px solid rgba(144, 202, 249, 0.14)',
                }}
              >
                <CircularProgress size={26} thickness={4.5} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Loading topics...
                  </Typography>
                </Box>
              </Box>
            )}
            {showNavigationError && (
              <Box sx={{ px: 1.4, py: 1 }} onClick={(event) => event.stopPropagation()}>
                <Typography variant="body2" color="error">
                  {getRequestErrorMessage(
                    navigationError,
                    'Unable to load topics. Please try again later.'
                  )}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  sx={{ mt: 0.5, px: 0 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    refetchNavigation();
                  }}
                >
                  Try again
                </Button>
              </Box>
            )}
            {!showNavigationLoading && !showNavigationError && !hasNavSections && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1.4, py: 1 }}>
                No topics configured yet.
              </Typography>
            )}
            {hasNavSections &&
              navSections.map((section, sectionIndex) => (
                <Box key={section.category}>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 1.1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        px: 1.4,
                        py: 0.45,
                        borderRadius: '999px',
                        backgroundColor: 'rgba(34, 197, 94, 0.16)',
                        color: '#86efac',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        fontSize: '0.78rem',
                        textAlign: 'center',
                      }}
                    >
                      {section.category}
                    </Typography>
                  </Box>
                  {section.topics.map((topic) => {
                    const path = getTopicPath(topic);

                    return (
                      <ListItem key={`${section.category}-${topic.label}`} disablePadding>
                        <ListItemButton
                          component="a"
                          href={path}
                          onClick={handleNavLinkClick(path)}
                          sx={{
                            py: 0.75,
                            px: 1.4,
                            borderRadius: '10px',
                            mb: 0.35,
                            transition: 'all 0.18s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              transform: 'translateX(-2px)',
                            },
                            '&.active': {
                              backgroundColor: 'rgba(125, 211, 252, 0.16)',
                            },
                          }}
                        >
                          <ListItemText primary={topic.label} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                  {sectionIndex !== navSections.length - 1 && (
                    <Divider
                      sx={{
                        mt: 1,
                        mb: 0.7,
                        borderColor: 'rgba(34, 197, 94, 0.35)',
                      }}
                    />
                  )}
                </Box>
              ))}
          </List>
        </Box>
      </Drawer>

      <Dialog
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        fullWidth
        maxWidth="lg"
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', overflowX: 'hidden' }}>
          <IconButton
            aria-label="close admin modal"
            onClick={() => setAdminOpen(false)}
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              zIndex: 1,
              color: 'text.secondary',
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <AdminTopics />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
