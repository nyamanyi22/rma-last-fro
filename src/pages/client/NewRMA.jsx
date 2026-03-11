import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
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
import rmaService from '../../services/api/rmaService';

const steps = [
  "Select RMA Type & Product",
  "Describe Issue & Upload Proof",
  "Review & Submit"
];

const NewRMA = () => {
  const [formData, setFormData] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      // Step 1
      rmaType: "simple_return",
      productId: "",
      product: null,
      saleId: "",
      serialNumber: "",
      receiptNumber: "",

      // Step 2
      reason: "",
      issueDescription: "",
      attachments: [],

      // Contact Info (from user profile)
      contactName: user.name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
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

    // Validate Step 1
    if (activeStep === 0) {
      if (!formData.productId) {
        setError("Please select a product");
        return;
      }
      if (formData.rmaType === 'warranty_repair' && !formData.saleId) {
        setError("Please select the purchase for warranty/repair claim");
        return;
      }
    }

    // Validate Step 2
    if (activeStep === 1) {
      if (!formData.reason) {
        setError("Please select a reason");
        return;
      }
      if (!formData.issueDescription || formData.issueDescription.length < 10) {
        setError("Please describe the issue in detail (minimum 10 characters)");
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`📎 Submitting RMA with ${formData.attachments?.length || 0} attachment(s)`);
      const response = await rmaService.submitRma({
        rmaType: formData.rmaType,
        productId: formData.productId,
        saleId: formData.saleId || null,
        reason: formData.reason,
        issueDescription: formData.issueDescription,
        serialNumber: formData.serialNumber,
        receiptNumber: formData.receiptNumber,
        attachments: formData.attachments,
      });

      setSuccess(`RMA submitted! Number: ${response.data?.rmaNumber || response.data?.rma_number || 'N/A'}`);
      setTimeout(() => navigate("/client/rma/history"), 3000);
    } catch (err) {
      setError(err.message || "Failed to submit RMA");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <RMAFormStep1 formData={formData} onChange={handleFormChange} />;
      case 1:
        return (
          <RMAFormStep2
            formData={formData}
            onChange={handleFormChange}
            rmaType={formData.rmaType}
          />
        );
      case 2:
        return <RMAFormStep3 formData={formData} rmaType={formData.rmaType} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Create New Request
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 4 }}>
        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          </Fade>
        )}

        {success && (
          <Fade in={!!success}>
            <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
          </Fade>
        )}

        <Stepper activeStep={activeStep} sx={{ pt: 1, pb: 5 }} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>{getStepContent(activeStep)}</Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, pt: 3 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
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