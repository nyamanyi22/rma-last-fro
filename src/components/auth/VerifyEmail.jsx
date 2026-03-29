import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Fade,
  Grow
} from '@mui/material';
import { 
  Email as EmailIcon, 
  CheckCircle as SuccessIcon, 
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import authService from '../../services/api/authService';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (email && token) {
      handleVerify();
    } else {
      setError('Missing verification information. Please check your link.');
      setLoading(false);
    }
  }, [email, token]);

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);

    try {
      await authService.verifyEmail(email, token);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Email verification failed. The link may be expired.');
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setVerifying(true);
    setError(null);
    try {
      await authService.resendVerificationEmail(email);
      setSuccess('Resent');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setVerifying(false);
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
      <Container component="main" maxWidth="sm">
        <Grow in timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 4, 
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Logo area or Title */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '24px', 
                  bgcolor: 'primary.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                }}
              >
                {success === true ? (
                  <SuccessIcon sx={{ fontSize: 48, color: 'white' }} />
                ) : error ? (
                  <ErrorIcon sx={{ fontSize: 48, color: 'white' }} />
                ) : (
                  <EmailIcon sx={{ fontSize: 48, color: 'white' }} />
                )}
              </Box>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'text.primary',
                  background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Email Verification
              </Typography>
            </Box>

            <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {(loading || verifying) && (
                <Fade in>
                  <Box sx={{ py: 2 }}>
                    <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                    <Typography variant="h6" color="text.secondary">
                      {verifying && !loading ? 'Validating your details...' : 'Working on it...'}
                    </Typography>
                  </Box>
                </Fade>
              )}

              {error && !verifying && (
                <Fade in>
                  <Box>
                    <Alert 
                      severity="error" 
                      variant="outlined"
                      sx={{ 
                        mb: 4, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: 28 }
                      }}
                    >
                      {error}
                    </Alert>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Something went wrong. The link might be expired or already used.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Button 
                        fullWidth
                        variant="contained" 
                        startIcon={<RefreshIcon />}
                        onClick={handleResend} 
                        disabled={!email}
                        sx={{ height: 48 }}
                      >
                        Resend Verification
                      </Button>
                      <Button 
                        fullWidth
                        variant="outlined" 
                        component={RouterLink}
                        to="/login"
                        startIcon={<BackIcon />}
                        sx={{ height: 48 }}
                      >
                        Back to Login
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              )}

              {success === true && !verifying && (
                <Fade in>
                  <Box>
                    <Alert 
                      severity="success" 
                      variant="outlined"
                      sx={{ 
                        mb: 4, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { fontSize: 28 }
                      }}
                    >
                      Verification Successful!
                    </Alert>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Your account is now active and ready. You can now access your dashboard and submit RMA requests.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        height: 56, 
                        fontSize: '1.1rem',
                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                      }}
                    >
                      Login to Your Account
                    </Button>
                  </Box>
                </Fade>
              )}

              {success === 'Resent' && !verifying && (
                <Fade in>
                  <Box>
                    <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                      A new verification link has been sent to <strong>{email}</strong>.
                    </Alert>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                      Please wait a few minutes. Don't forget to check your spam folder!
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      component={RouterLink}
                      to="/login"
                      sx={{ height: 48 }}
                    >
                      Return to Login
                    </Button>
                  </Box>
                </Fade>
              )}

              {!loading && !verifying && !error && !success && (
                <Fade in>
                  <Box>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Welcome! Click the button below to confirm your identity and complete your registration.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="large"
                      onClick={handleVerify}
                      sx={{ height: 56, fontSize: '1.1rem' }}
                    >
                      Verify My Email
                    </Button>
                  </Box>
                </Fade>
              )}
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant="caption" color="text.disabled">
                &copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'RMA Management System'}. All rights reserved.
              </Typography>
            </Box>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default VerifyEmail;
