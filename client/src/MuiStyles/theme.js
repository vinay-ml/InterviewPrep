import { createTheme } from '@mui/material/styles';

const appFontFamily =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
const monoFontFamily =
  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", monospace';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
  },
  typography: {
    fontFamily: appFontFamily,
    htmlFontSize: 16,
    fontSize: 16,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      lineHeight: 1.08,
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
      lineHeight: 1.12,
      fontWeight: 700,
      letterSpacing: '-0.035em',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
      lineHeight: 1.18,
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontSize: 'clamp(1.25rem, 2.5vw, 1.875rem)',
      lineHeight: 1.22,
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
      lineHeight: 1.28,
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      lineHeight: 1.35,
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.005em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.55,
      letterSpacing: '0.005em',
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 600,
      letterSpacing: '0.005em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.45,
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    button: {
      fontSize: '0.875rem',
      lineHeight: 1.45,
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      letterSpacing: '0.015em',
    },
    overline: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: appFontFamily,
        },
        code: {
          fontFamily: monoFontFamily,
        },
        pre: {
          fontFamily: monoFontFamily,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: appFontFamily,
          fontSize: '1rem',
          lineHeight: 1.5,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.95rem',
          lineHeight: 1.45,
        },
        secondary: {
          fontSize: '0.825rem',
          lineHeight: 1.4,
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
