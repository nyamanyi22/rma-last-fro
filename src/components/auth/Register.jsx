import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import Select from "react-select";
import {
  PersonAdd,
  Email,
  CheckCircle,
  Visibility,
  VisibilityOff,
  SupportAgent,
  Speed,
  Security,
  ArrowForward,
  Person,
} from "@mui/icons-material";
import authService from "../../services/api/authService";
import { getData } from "country-list";

const steps = ["Account Details", "Check Email", "Complete"];

const countryOptions = getData()
  .map((country) => ({ value: country.code, label: country.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    address: "",
    city: "",

  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Step 1: Submit registration
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData);
      localStorage.setItem("pending_email", formData.email);
      handleNext();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend verification email
  const handleResendEmail = async () => {
    setError("");
    setLoading(true);
    try {
      const email = localStorage.getItem("pending_email");
      if (!email) throw new Error("No pending email found");
      await authService.resendVerificationEmail(email);
      setSuccess("Resent");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleSubmitStep1}>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your account to start managing RMA requests
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="name@example.com"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Minimum 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
                  Country
                </Typography>
                <Select
                  options={countryOptions}
                  placeholder="Select Country"
                  isSearchable
                  value={countryOptions.find(c => c.value === formData.country) || null}
                  onChange={(option) => setFormData({ ...formData, country: option?.value || "" })}
                  isDisabled={loading}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 8,
                      borderColor: '#e0e0e0',
                      '&:hover': { borderColor: theme.palette.primary.main },
                    }),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  name="address"
                  label="Shipping Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
              disabled={loading}
              endIcon={!loading && <ArrowForward />}
            >
              {loading ? <CircularProgress size={24} /> : "Create Account"}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Email sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We've sent a verification link to <strong>{formData.email || localStorage.getItem("pending_email")}</strong>.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please check your inbox and click the link to activate your account.
            </Typography>

            {success === "Resent" && <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>Verification email resent!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            <Button
              variant="outlined"
              onClick={handleResendEmail}
              disabled={loading}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : "Resend Email"}
            </Button>

            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              sx={{ borderRadius: 2 }}
            >
              Back to Login
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CheckCircle sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Registration Complete!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your account has been created successfully.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You can now login and submit RMA requests.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate("/login")}
              sx={{ py: 1.5, borderRadius: 2 }}
              endIcon={<ArrowForward />}
            >
              Go to Login
            </Button>
          </Box>
        );

      default:
        return null;
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
                Join RMA Pro! 🚀
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal' }}>
                Create an account to track your returns, submit RMA requests, and get real-time updates.
              </Typography>

              {/* Features List */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Real-time RMA status tracking</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Secure & encrypted account</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Typography variant="body1">Instant email notifications</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Registration Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Customer Registration
                </Typography>
              </Box>

              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              {activeStep === 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Already have an account?
                    </Typography>
                  </Divider>
                  <Link component={RouterLink} to="/login" variant="body2" sx={{ fontWeight: 500 }}>
                    Sign in here →
                  </Link>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Register;