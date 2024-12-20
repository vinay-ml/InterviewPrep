import React from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  // Styles for active and inactive links
  const linkStyles = {
    color: "inherit",
    textDecoration: "none",
    fontWeight: "normal", // Changed font weight to normal
    marginLeft: "15px",
    paddingBottom: "5px",
    fontSize: "16px", // Optional: Adjust font size if needed
  };

  const activeLinkStyles = {
    ...linkStyles,
    borderBottom: "2px solid #fff",
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: 1300,
        backgroundColor: "#1976d2",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          InterviewPrep
        </Typography>
        <Box>
          <Button
            component={NavLink}
            to="/javascript-theory"
            sx={
              location.pathname === "/javascript-theory"
                ? activeLinkStyles
                : linkStyles
            }
          >
            JavaScript
          </Button>

          <Button
            component={NavLink}
            to="/python-theory"
            sx={
              location.pathname === "/python-theory"
                ? activeLinkStyles
                : linkStyles
            }
          >
            Python
          </Button>

          <Button
            component={NavLink}
            to="/sql"
            sx={location.pathname === "/sql" ? activeLinkStyles : linkStyles}
          >
            SQL
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
