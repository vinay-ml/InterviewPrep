import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      setDrawerOpen(false);
    }
  }, [isMobile]);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const navLinks = [
    { text: "JavaScript", to: "/javascript" },
    { text: "Python", to: "/python" },
    { text: "SQL", to: "/sql" },
    { text: "ReactJS", to: "/reactjs" },
    { text: "NodeJS", to: "/nodejs" },
    { text: "HTML", to: "/html" },
    { text: "CSS", to: "/css" },
    { text: "PowerBI", to: "/powerbi" },
  ];

  const linkStyles = {
    color: "inherit",
    textDecoration: "none",
    fontWeight: "normal",
    marginLeft: "15px",
    paddingBottom: "5px",
    fontSize: "16px",
  };

  const activeLinkStyles = {
    ...linkStyles,
    borderBottom: "2px solid #fff",
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          zIndex: 1300,
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1 }}
            component={NavLink}
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            InterviewPrep
          </Typography>

          {isMobile ? (
            <IconButton color="inherit" edge="end" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box>
              {navLinks.map((link) => (
                <Button
                  key={link.text}
                  component={NavLink}
                  to={link.to}
                  sx={
                    location.pathname === link.to
                      ? activeLinkStyles
                      : linkStyles
                  }
                >
                  {link.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
      >
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography
            variant="h6"
            sx={{
              padding: "16px",
              textAlign: "center",
              backgroundColor: "#1976d2",
              color: "#fff",
            }}
          >
            Navigation
          </Typography>
          <Divider />
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  sx={{
                    "&.active": {
                      backgroundColor: "#e3f2fd",
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
