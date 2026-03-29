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
import { PersonAdd, Email, CheckCircle } from "@mui/icons-material";
import authService from "../../services/api/authService";
import { getData } from "country-list";

const steps = ["Account Details", "Check Email", "Complete"];

const countryOptions = getData()
  .map((country) => ({ value: country.code, label: country.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // Step 1: Submit registration
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError("");

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
      await authService.register(formData);

      // Store email locally for resend functionality
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
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="body1" paragraph>
              Register as a customer to submit RMA requests.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Country</Typography>
                <Select
                  options={countryOptions}
                  placeholder="Select Country"
                  isSearchable
                  value={countryOptions.find(c => c.value === formData.country) || null}
                  onChange={(option) => setFormData({ ...formData, country: option?.value || "" })}
                  isDisabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="postalCode"
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
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

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              {loading ? <CircularProgress size={24} /> : "Continue"}
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
            <Typography variant="body1" paragraph>
              We've sent a verification link to <strong>{formData.email}</strong>.
              Please check your inbox and click the link to activate your account.
            </Typography>

            {success === "Resent" && <Alert severity="info" sx={{ mb: 2 }}>Verification email resent!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button variant="outlined" onClick={handleResendEmail} disabled={loading} sx={{ mr: 1 }}>
              {loading ? <CircularProgress size={20} /> : "Resend Email"}
            </Button>

            <Button component={RouterLink} to="/login" variant="text">
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
            <Typography variant="body2" paragraph>
              Your account has been created. You can now login and submit RMA requests.
            </Typography>
            <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
              Go to Login
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
            <Typography component="h1" variant="h5">Customer Registration</Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
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