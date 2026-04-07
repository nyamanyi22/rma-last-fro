import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link,
  CircularProgress,
  Fade,
  Grow,
  InputAdornment
} from '@mui/material';
import { 
  Email as EmailIcon, 
  LockReset as ResetIcon,
  ArrowBack as BackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../../services/api/authService';
import { usePortalSettings } from '../../context/PortalSettingsContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { portalName } = usePortalSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        py: 4
      }}
    >
      <Container component="main" maxWidth="xs">
        <Grow in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 4, md: 5 }, 
              borderRadius: 4, 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: '18px', 
                  bgcolor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                }}
              >
                <ResetIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 1,
                  background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Forgot Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No worries! Enter your email and we'll send you a secure link to reset your account.
              </Typography>
            </Box>

            {error && (
              <Fade in>
                <Alert severity="error" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success ? (
              <Fade in>
                <Box sx={{ textAlign: 'center' }}>
                  <Alert severity="success" variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                    Success! Reset link has been sent to your email.
                  </Alert>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Didn't get the email? Try checking your spam folder or wait a few minutes.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/login')}
                    sx={{ height: 48, borderRadius: 2 }}
                  >
                    Back to Login
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setSuccess(false)}
                    sx={{ mt: 1 }}
                  >
                    Try another email
                  </Button>
                </Box>
              </Fade>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  endIcon={!loading && <SendIcon />}
                  sx={{ 
                    mt: 3, 
                    mb: 4, 
                    height: 52, 
                    borderRadius: 2,
                    fontSize: '1rem',
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 1,
                      textDecoration: 'none',
                      fontWeight: 600,
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <BackIcon sx={{ fontSize: 18 }} />
                    Back to Login
                  </Link>
                </Box>
              </Box>
            )}

            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.disabled">
                &copy; {new Date().getFullYear()} {portalName}. All rights reserved.
              </Typography>
            </Box>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
