// src/pages/client/NewRMA.jsx
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Fade
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RMAFormStep1 from "../../components/client/rma/RMAFormStep1";
import RMAFormStep2 from "../../components/client/rma/RMAFormStep2";
import RMAFormStep3 from "../../components/client/rma/RMAFormStep3";

const steps = [
  "Select RMA Type & Product",
  "Describe Issue & Upload Proof",
  "Review & Submit"
];

const NewRMA = () => {
  // Get user from localStorage
  // Use lazy initialization for state to avoid recreating object on every render
  const [formData, setFormData] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      // Step 1: Product & RMA Type
      rmaType: "return", // "return" or "warranty"
      productId: "",
      serialNumber: "",
      purchaseDate: "",
      receiptNumber: "",

      // Step 2: Issue Details
      reason: "",
      issueDescription: "",
      attachments: [], // Array of file objects

      // Step 3: Contact Info (pre-filled from user profile)
      contactName: user.name || "",
      contactEmail: user.email || "",
      contactPhone: user.phone || "",
      shippingAddress: user.address || "",
    };
  });

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    setError("");
    // Validation would happen here
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate RMA number
      const rmaNumber = `RMA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
      setSuccess(`RMA submitted successfully! Your RMA number is: ${rmaNumber}`);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/client/dashboard");
      }, 3000);

    } catch (err) {
      setError("Failed to submit RMA. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <RMAFormStep1
            formData={formData}
            onChange={handleFormChange}
          />
        );
      case 1:
        return (
          <RMAFormStep2
            formData={formData}
            onChange={handleFormChange}
            rmaType={formData.rmaType}
          />
        );
      case 2:
        return (
          <RMAFormStep3
            formData={formData}
            rmaType={formData.rmaType}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Create New Request
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </Fade>
        )}

        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>
          </Fade>
        )}

        <Stepper activeStep={activeStep} sx={{ pt: 1, pb: 5 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, minHeight: 300 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
            size="large"
            sx={{ borderRadius: 2, px: 4 }}
          >
            {loading ? "Processing..." :
              activeStep === steps.length - 1 ? "Submit Request" : "Next Step"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NewRMA;
