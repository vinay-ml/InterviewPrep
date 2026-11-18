import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('The page failed to render', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', mt: 10, px: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          This page could not be shown.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reload the page. If you are offline, open a topic you have already viewed on this device.
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Box>
    );
  }
}

export default AppErrorBoundary;
