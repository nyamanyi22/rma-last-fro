import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Fade,
  Grow,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOpen as PasswordIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/api/authService';
import { usePortalSettings } from '../../context/PortalSettingsContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { portalName } = usePortalSettings();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing reset token. Please request a new link.');
    }
  }, [token, email]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword(
        email,
        token,
        formData.password,
        formData.confirmPassword
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be expired.');
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
                {success ? (
                  <SuccessIcon sx={{ fontSize: 32, color: 'white' }} />
                ) : (
                  <PasswordIcon sx={{ fontSize: 32, color: 'white' }} />
                )}
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
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set a strong new password to keep your account secure.
              </Typography>
            </Box>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  variant="outlined" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<ErrorIcon />}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {success ? (
              <Fade in>
                <Box sx={{ textAlign: 'center' }}>
                  <Alert severity="success" variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                    Success! Your password has been updated.
                  </Alert>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    We're taking you back to the login page now...
                  </Typography>
                  <CircularProgress size={30} sx={{ mt: 2 }} />
                </Box>
              </Fade>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || (error && error.includes('token'))}
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || (error && error.includes('token'))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || (error && error.includes('token'))}
                  sx={{ 
                    mt: 3, 
                    mb: 2, 
                    height: 52, 
                    borderRadius: 2,
                    fontSize: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
                
                {error && error.includes('token') && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/forgot-password')}
                    sx={{ mt: 1, borderRadius: 2 }}
                  >
                    Request New Link
                  </Button>
                )}
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

export default ResetPassword;
