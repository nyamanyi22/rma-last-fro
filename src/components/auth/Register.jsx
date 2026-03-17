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
} from "@mui/material";
import Select from "react-select";
import countries_list from "country-list";
import { PersonAdd, Email, CheckCircle } from "@mui/icons-material";
import authService from "../../services/api/authService";
import { getData } from "country-list";

const steps = ["Account Details", "Email Verification", "Complete"];

const countryOptions = getData().map((country) => ({
  value: country.code,
  label: country.name,
})).sort((a, b) => a.label.localeCompare(b.label));

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
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
    postalCode: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitStep1 = async (e) => { // Make async
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError("First name and last name are required");
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
      // CALL REAL BACKEND API
      const response = await authService.register(formData);

      console.log("Registration successful:", response);

      // Store email for verification step
      localStorage.setItem('pending_email', formData.email);

      handleNext();
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setError("");

    const storedCode = localStorage.getItem('verification_code');

    if (verificationCode !== storedCode) {
      setError("Invalid verification code");
      return;
    }

    handleNext();
  };

  const handleCompleteRegistration = async () => {
    // User is already registered and logged in via authService.register
    navigate('/client');
  };

  // ... rest of your component (renderStepContent and return) stays the same

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleSubmitStep1}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="body1" color="text.secondary" paragraph>
              Register as a customer to submit RMA requests.
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Staff accounts are created by administrators only.
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
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Minimum 6 characters"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Country *
                </Typography>
                <Select
                  options={countryOptions}
                  placeholder="Select Country"
                  isSearchable
                  isDisabled={loading}
                  value={countryOptions.find(c => c.value === formData.country) || null}
                  onChange={(option) => {
                    setFormData({
                      ...formData,
                      country: option ? option.value : ""
                    });
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '56px',
                      background: 'transparent',
                      borderColor: 'rgba(0, 0, 0, 0.23)',
                      '&:hover': {
                        borderColor: 'rgba(0, 0, 0, 0.87)',
                      },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: 'rgba(0, 0, 0, 0.6)',
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 1500,
                    })
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  name="postalCode"
                  label="Postal Code"
                  value={formData.postalCode}
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
                  helperText="Required for RMA shipping"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Continue to Verification
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Email sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Verify your Email
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              We've sent a verification link to <strong>{formData.email}</strong>.
              Please check your inbox and click the link to activate your account.
            </Typography>

            {success === 'Resent' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Verification email has been resent!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, mb: 2 }}>
              Didn't receive the email? Check your spam folder or try resending.
            </Typography>

            <Button 
              variant="outlined" 
              onClick={async () => {
                setError("");
                setLoading(true);
                try {
                  await authService.resendVerificationEmail(formData.email);
                  setSuccess('Resent');
                  setTimeout(() => setSuccess(false), 5000);
                } catch (err) {
                  setError(err.message || "Failed to resend email.");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? <CircularProgress size={20} /> : "Resend Email"}
            </Button>
            
            <Button 
              component={RouterLink} 
              to="/login"
              variant="text"
            >
              Back to Login
            </Button>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Email Verified Successfully!
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Your account has been created. You can now submit RMA requests.
            </Typography>

            <Button
              variant="contained"
              onClick={handleCompleteRegistration}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <PersonAdd sx={{ mr: 1, color: "primary.main" }} />
            <Typography component="h1" variant="h5">
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

          <Grid container justifyContent="center" sx={{ mt: 3 }}>
            <Grid>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;