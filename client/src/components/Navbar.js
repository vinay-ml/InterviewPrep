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
import { useGetNavigationConfigQuery } from '../redux/api/navigationApi';

const getTopicPath = (topic) => topic.path || `/${topic.label.trim().toLowerCase()}`;

const Navbar = () => {
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const {
    data: navigationConfig,
    error: navigationError,
    isLoading: navigationLoading,
    isFetching: navigationFetching,
  } = useGetNavigationConfigQuery();
  const navSections = navigationConfig?.data || [];
  const hasNavSections = navSections.length > 0;

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

          <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
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
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            Navigation
          </Typography>
          <Divider />
          <List sx={{ py: 1, px: 1 }}>
            {(navigationLoading || navigationFetching) && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1.4, py: 1 }}>
                Loading topics...
              </Typography>
            )}
            {navigationError && (
              <Typography variant="body2" color="error" sx={{ px: 1.4, py: 1 }}>
                Unable to load topics. Please try again later.
              </Typography>
            )}
            {!navigationLoading && !navigationFetching && !navigationError && !hasNavSections && (
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
    </>
  );
};

export default Navbar;
