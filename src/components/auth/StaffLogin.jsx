import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import authService from '../../services/api/authService'; // 👈 Import your auth service

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 👈 CALL REAL BACKEND API
      const response = await authService.staffLogin(email, password);

      console.log('Staff login successful:', response);

      // Redirect based on role from backend
      if (response.user.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        // For csr and admin
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 48, color: 'primary.main' }} />
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Staff Portal
          </Typography>

          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Internal Access Only - No Public Registration
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In to Staff Portal'}
            </Button>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Demo Staff Accounts:</strong><br />
                • CSR: csr@example.com / password<br />
                • Admin: admin@example.com / password<br />
                • Super Admin: superadmin@example.com / password
              </Typography>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <a href="/login" style={{ color: 'primary.main' }}>
                ← Customer Login Portal
              </a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StaffLogin;