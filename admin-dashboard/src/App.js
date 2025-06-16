import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

function App() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🚨 Rindwa App Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Welcome to the Rindwa App Admin Dashboard. This is a placeholder for the full admin interface.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Backend API is running and ready to serve data.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 