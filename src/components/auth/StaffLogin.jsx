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
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  AdminPanelSettings,
  Visibility,
  VisibilityOff,
  Security,
  Speed,
  People,
  ArrowForward,
  Business,
} from '@mui/icons-material';
import authService from '../../services/api/authService';

const StaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Work email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.staffLogin(email, password);

      console.log('Staff login successful:', response);

      // Redirect based on role from backend
      if (response.user.role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Staff account not activated.');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please wait a few minutes.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left Column - Welcome Message & Features */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
              {/* Logo/Brand */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <AdminPanelSettings sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Staff Portal
                </Typography>
              </Box>

              {/* Welcome Message */}
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                Staff Access Only 🔐
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal' }}>
                Manage RMA requests, process returns, and support customers efficiently.
              </Typography>

              {/* Features List */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Process RMAs in real-time</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Secure staff authentication</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Manage customer communications</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Business sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Role-based access control</Typography>
                </Box>
              </Box>

              {/* Demo Accounts Card */}
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  p: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                  <AdminPanelSettings sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                  Demo Staff Accounts:
                </Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" display="block">
                      <strong>CSR:</strong><br />
                      csr@example.com
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" display="block">
                      <strong>Admin:</strong><br />
                      admin@example.com
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" display="block">
                      <strong>Super Admin:</strong><br />
                      super@example.com
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Password: <strong>password</strong> for all demo accounts
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column - Login Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Staff Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Internal Access Only — No Public Registration
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Work Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  placeholder="staff@company.com"
                  sx={{ mb: 2 }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 2, mb: 3, py: 1.5, borderRadius: 2 }}
                  disabled={loading}
                  endIcon={!loading && <ArrowForward />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In to Staff Portal'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Not a staff member?
                  </Typography>
                </Divider>

                <Typography variant="body2" align="center">
                  <a href="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                    ← Customer Login Portal
                  </a>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StaffLogin;