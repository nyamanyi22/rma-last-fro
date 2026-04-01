import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Grid,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  SupportAgent,
  Speed,
  Security,
  ArrowForward
} from '@mui/icons-material';
import authService from '../../services/api/authService';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  // Email validation function
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setError('');
    setResendMessage('');

    try {
      await authService.resendVerificationEmail(email);
      setResendMessage('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., name@example.com)');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/client');
    } catch (err) {
      if (err.unverified) {
        setError(err.message);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Your account is not activated. Please check your email for verification link.');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
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
                  <SupportAgent sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  RMA Pro
                </Typography>
              </Box>

              {/* Welcome Message */}
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                Welcome Back!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal' }}>
                Track your returns, check RMA status, and get support—all in one place.
              </Typography>

              {/* Features List */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Real-time RMA status updates</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Secure & encrypted communication</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SupportAgent sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">24/7 support for your returns</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Login Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Customer Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your credentials to access your account
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2, borderRadius: 2 }}
                    action={
                      error.includes('verify your email') && (
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={handleResend}
                          disabled={resendLoading}
                        >
                          {resendLoading ? 'Sending...' : 'Resend'}
                        </Button>
                      )
                    }
                  >
                    {error}
                  </Alert>
                )}

                {resendMessage && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {resendMessage}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                  placeholder="name@example.com"
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
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>

                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid>
                    <Link component={RouterLink} to="/forgot-password" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid>
                    <Link component={RouterLink} to="/register" variant="body2" sx={{ fontWeight: 500 }}>
                      Create an account →
                    </Link>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Typography variant="body2" align="center">
                  <Link href="/admin/login" color="secondary" underline="hover">
                    Staff Login →
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CustomerLogin;