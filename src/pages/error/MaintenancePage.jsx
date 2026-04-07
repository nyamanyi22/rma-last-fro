import React from 'react';
import BuildCircleOutlined from '@mui/icons-material/BuildCircleOutlined';
import { Box, Button, Container, Paper, Typography } from '@mui/material';

const MaintenancePage = () => {
  const message = sessionStorage.getItem('maintenance_message')
    || 'The system is currently in maintenance mode. Please try again later.';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
          }}
        >
          <BuildCircleOutlined sx={{ fontSize: 56, color: '#f59e0b', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
            Maintenance Mode
          </Typography>
          <Typography variant="body1" sx={{ color: '#475569', mb: 4, lineHeight: 1.7 }}>
            {message}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ px: 3, py: 1.25 }}>
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => { window.location.href = '/login'; }} sx={{ px: 3, py: 1.25 }}>
              Go To Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MaintenancePage;
