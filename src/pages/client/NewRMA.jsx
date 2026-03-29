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
  Fade,
  Snackbar
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
      policyAgreed: false,
    };
  });

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    setErrors({});
    setShowErrorToast(false);
    const newErrors = {};

    // Validate Step 1
    if (activeStep === 0) {
      if (!formData.productId) {
        newErrors.productId = "Please select a product";
      }
      if (formData.rmaType === 'warranty_repair' && !formData.saleId) {
        newErrors.saleId = "Please select the purchase for warranty/repair claim";
      }
    }

    // Validate Step 2
    if (activeStep === 1) {
      if (!formData.reason) {
        newErrors.reason = "Please select a reason";
      }
      if (!formData.issueDescription || formData.issueDescription.length < 10) {
        newErrors.issueDescription = "Please describe the issue in detail (minimum 10 characters)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowErrorToast(true);
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setErrors({});
    setShowErrorToast(false);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    setShowErrorToast(false);

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
      if (err.errors) setErrors(err.errors);
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <RMAFormStep1 formData={formData} onChange={handleFormChange} errors={errors} />;
      case 1:
        return (
          <RMAFormStep2
            formData={formData}
            onChange={handleFormChange}
            rmaType={formData.rmaType}
            errors={errors}
          />
        );
      case 2:
        return <RMAFormStep3 formData={formData} rmaType={formData.rmaType} onChange={handleFormChange} errors={errors} />;
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
        <Snackbar
          open={showErrorToast}
          autoHideDuration={6000}
          onClose={() => setShowErrorToast(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowErrorToast(false)} severity="error" sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: 3 }}>
            There are validation errors with your submission. Please check the highlighted fields.
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess("")}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: 3 }}>
            {success}
          </Alert>
        </Snackbar>

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
            disabled={loading || (activeStep === steps.length - 1 && !formData.policyAgreed)}
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