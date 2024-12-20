import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Button color="inherit" component={Link} to="/javascript-theory">
            JavaScript
          </Button>
          <Button color="inherit" component={Link} to="/python-theory">
            Python
          </Button>
          <Button color="inherit" component={Link} to="/sql">
            SQL
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
