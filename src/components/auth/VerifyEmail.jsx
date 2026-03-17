import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      setError('Missing verification information.');
      setLoading(false);
    }
  }, []);

  const handleVerify = async () => {
    setVerifying(true);
    setLoading(false);
    setError(null);

    try {
      await authService.verifyEmail(email, token);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Email verification failed. The link may be expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.resendVerificationEmail(email);
      setSuccess('Resent');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3, textAlign: 'center' }}>
          <Typography component="h1" variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Email Verification
          </Typography>

          {(loading || verifying) && (
            <Box sx={{ py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Verifying your email...</Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
              <Typography variant="body2" gutterBottom>
                Something went wrong. You can try to resend the verification email.
              </Typography>
              <Button 
                variant="outlined" 
                onClick={handleResend} 
                disabled={loading || !email}
                sx={{ mt: 2 }}
              >
                Resend Verification Email
              </Button>
            </Box>
          )}

          {success === true && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Your email has been successfully verified!
              </Alert>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </Box>
          )}

          {success === 'Resent' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Verification email has been resent to {email}.
              </Alert>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          )}

          {!loading && !verifying && !error && !success && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 3 }}>
                Click the button below to verify your email address.
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleVerify}
              >
                Verify Email
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail;
