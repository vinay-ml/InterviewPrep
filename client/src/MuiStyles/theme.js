import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0d1117",
      paper: "#161b22",
    },
  },
  typography: {
    h1: {
      fontSize: "2rem",
      [`@media (min-width:600px)`]: {
        fontSize: "2.5rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "3rem",
      },
    },
    h2: {
      fontSize: "1.75rem",
      [`@media (min-width:600px)`]: {
        fontSize: "2.25rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "2.75rem",
      },
    },
    h3: {
      fontSize: "1.5rem",
      [`@media (min-width:600px)`]: {
        fontSize: "2rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "2.5rem",
      },
    },
    h4: {
      fontSize: "1.25rem",
      [`@media (min-width:600px)`]: {
        fontSize: "1.75rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "2.25rem",
      },
    },
    h5: {
      fontSize: "1rem",
      [`@media (min-width:600px)`]: {
        fontSize: "1.6rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1.8rem",
      },
    },
    h6: {
      fontSize: "0.875rem",
      [`@media (min-width:600px)`]: {
        fontSize: "1.2rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1.4rem",
      },
    },
    body1: {
      fontSize: "0.875rem",
      [`@media (min-width:600px)`]: {
        fontSize: "1rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1.125rem",
      },
    },
    body2: {
      fontSize: "0.75rem",
      [`@media (min-width:600px)`]: {
        fontSize: "0.875rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1rem",
      },
    },
    subtitle1: {
      fontSize: "0.875rem",
      [`@media (min-width:600px)`]: {
        fontSize: "1rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1.125rem",
      },
    },
    subtitle2: {
      fontSize: "0.75rem",
      [`@media (min-width:600px)`]: {
        fontSize: "0.875rem",
      },
      [`@media (min-width:960px)`]: {
        fontSize: "1rem",
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          opacity: 0.9,
        },
      },
    },
  },
});
