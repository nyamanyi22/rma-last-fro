import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
  Alert,
} from "@mui/material";
import { CheckCircle, Warning, Info } from "@mui/icons-material";

const RMAFormStep3 = ({ formData, rmaType }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get product name from ID (in real app, fetch from API)
  const getProductName = () => {
    const products = [
      { id: "1", name: "Dell XPS 13 Laptop" },
      { id: "2", name: "HP Pavilion Desktop" },
      { id: "3", name: "Logitech MX Master 3" },
      { id: "4", name: "Samsung 27\" Monitor" },
      { id: "5", name: "Apple MacBook Pro 14\"" },
    ];
    const product = products.find(p => p.id === formData.productId);
    return product ? product.name : "Not selected";
  };

  // Get reason label
  const getReasonLabel = () => {
    const returnReasons = [
      { value: "shipping_damage", label: "Shipping Damage" },
      { value: "wrong_item", label: "Wrong Item Received" },
      { value: "defective_on_arrival", label: "Defective on Arrival" },
      { value: "customer_return", label: "Customer Return" },
      { value: "other_return", label: "Other" },
    ];

    const warrantyReasons = [
      { value: "product_failure", label: "Product Failure" },
      { value: "hardware_defect", label: "Hardware Defect" },
      { value: "software_issue", label: "Software Issue" },
      { value: "physical_damage", label: "Physical Damage" },
      { value: "performance_issue", label: "Performance Issue" },
      { value: "other_warranty", label: "Other" },
    ];

    const reasons = rmaType === "return" ? returnReasons : warrantyReasons;
    const reason = reasons.find(r => r.value === formData.reason);
    return reason ? reason.label : "Not specified";
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Step 3: Review & Submit
      </Typography>

      <Alert severity="info" icon={<Info />} sx={{ mb: 4, borderRadius: 2 }}>
        Please review all information before submitting. You cannot edit after submission.
      </Alert>

      <Grid container spacing={3}>
        {/* RMA Type Summary */}
        <Grid size={{ xs: 12 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: rmaType === 'return' ? 'warning.lighter' : 'primary.lighter',
              color: rmaType === 'return' ? 'warning.dark' : 'primary.dark',
              border: '1px solid',
              borderColor: rmaType === 'return' ? 'warning.light' : 'primary.light',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box sx={{ mr: 2, display: 'flex' }}>
              {rmaType === "return" ? (
                <Warning color="warning" fontSize="large" />
              ) : (
                <CheckCircle color="primary" fontSize="large" />
              )}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {rmaType === "return" ? "Simple Return Request" : "Warranty/Repair Claim"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {rmaType === "return"
                  ? "No warranty validation required. Admin will review based on uploaded proof."
                  : "Warranty will be validated against purchase date. Please ensure receipt is uploaded."}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Product Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
              Product Information
            </Typography>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Product</Typography>
                <Typography variant="body1" fontWeight={500}>{getProductName()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.serialNumber || "Not provided"}</Typography>
              </Box>

              {rmaType === "warranty" && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Purchase Date</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatDate(formData.purchaseDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Receipt Number</Typography>
                    <Typography variant="body1" fontWeight={500}>{formData.receiptNumber || "Not provided"}</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Issue Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
              Issue Details
            </Typography>

            <Box sx={{ display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Reason</Typography>
                <Typography variant="body1" fontWeight={500}>{getReasonLabel()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2" sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
                  {formData.issueDescription || "No description provided"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Attachments</Typography>
                <Typography variant="body1" fontWeight={500}>{formData.attachments.length} file(s) ready for upload</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Contact Information */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
              Contact & Shipping
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Contact Name</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.contactName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.contactEmail}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1" fontWeight={500}>{formData.contactPhone || "Not provided"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Shipping Address</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ whiteSpace: 'pre-line' }}>{formData.shippingAddress || "Not provided"}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RMAFormStep3;
