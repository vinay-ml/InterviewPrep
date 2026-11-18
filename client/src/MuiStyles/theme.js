import { createTheme } from '@mui/material/styles';

const appFontFamily =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"';
const monoFontFamily =
  'ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Monaco, "Courier New", monospace';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0d14',
      paper: 'rgba(22, 27, 34, 0.65)',
    },
    primary: {
      main: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
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
      fontSize: '2rem',
      lineHeight: 1.15,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': { fontSize: '2.25rem' },
      '@media (min-width:1200px)': { fontSize: '2.5rem' },
    },
    h2: {
      fontSize: '1.75rem',
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      '@media (min-width:600px)': { fontSize: '1.875rem' },
      '@media (min-width:1200px)': { fontSize: '2.125rem' },
    },
    h3: {
      fontSize: '1.5rem',
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      '@media (min-width:600px)': { fontSize: '1.625rem' },
      '@media (min-width:1200px)': { fontSize: '1.75rem' },
    },
    h4: {
      fontSize: '1.25rem',
      lineHeight: 1.3,
      fontWeight: 700,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': { fontSize: '1.375rem' },
      '@media (min-width:1200px)': { fontSize: '1.5rem' },
    },
    h5: {
      fontSize: '1.125rem',
      lineHeight: 1.35,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      '@media (min-width:600px)': { fontSize: '1.25rem' },
      '@media (min-width:1200px)': { fontSize: '1.375rem' },
    },
    h6: {
      fontSize: '1rem',
      lineHeight: 1.4,
      fontWeight: 600,
      letterSpacing: '0',
      '@media (min-width:600px)': { fontSize: '1.0625rem' },
      '@media (min-width:1200px)': { fontSize: '1.125rem' },
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      letterSpacing: '0',
      '@media (min-width:600px)': { fontSize: '1rem' },
      '@media (min-width:1200px)': { fontSize: '1.0625rem' },
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.55,
      letterSpacing: '0',
      '@media (min-width:600px)': { fontSize: '0.875rem' },
      '@media (min-width:1200px)': { fontSize: '0.9375rem' },
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 27, 34, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 27, 34, 0.65)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 17, 23, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 27, 34, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderRadius: 16,
          backgroundColor: 'rgba(22, 27, 34, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1d4ed8 100%)',
          boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%)',
            boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.6)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(59, 130, 246, 0.5)',
          color: '#93c5fd',
          '&:hover': {
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
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
