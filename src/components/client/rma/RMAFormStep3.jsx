import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Info,
  Inventory,
  Description,
  Receipt,
  Person,
  Email,
  Phone,
  LocationOn,
  AttachFile
} from "@mui/icons-material";
import { FormControlLabel, Checkbox, CircularProgress } from "@mui/material";
import { rmaApi } from '../../../services/api/api';

const RMAFormStep3 = ({ formData, rmaType, onChange }) => {
  const [policyText, setPolicyText] = useState("");
  const [loadingPolicy, setLoadingPolicy] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      let user = {};
      try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch (_) {}
      const isAdmin = ['admin', 'super_admin', 'csr'].includes(user.role);

      if (isAdmin) {
        // Admin users cannot access either policy endpoint — skip fetch entirely
        setPolicyText('Return policy review is waived for admin-initiated RMA submissions.');
        setLoadingPolicy(false);
        return;
      }

      const response = await rmaApi.getReturnPolicy();
      const policy = response.data?.data?.policy_text
        || response.data?.data
        || response.data?.policy_text
        || '';
      setPolicyText(policy || 'No return policy configured.');
    } catch (err) {
      console.error("Failed to fetch policy", err);
      setPolicyText("Unable to load return policy. Please contact support.");
    } finally {
      setLoadingPolicy(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeLabel = () => {
    return rmaType === 'return' ? 'Simple Return' :
      rmaType === 'warranty' ? 'Warranty Claim' :
        'Repair Request';
  };

  const getReasonLabel = () => {
    const reasons = {
      shipping_damage: "Shipping Damage",
      wrong_item: "Wrong Item Received",
      defective_on_arrival: "Defective on Arrival",
      customer_return: "Customer Return",
      product_failure: "Product Failure",
      hardware_defect: "Hardware Defect",
      software_issue: "Software Issue",
      physical_damage: "Physical Damage",
      performance_issue: "Performance Issue",
      other: "Other"
    };
    return reasons[formData.reason] || formData.reason;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Step 3: Review Your Request
      </Typography>

      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        Please review all information before submitting. You cannot edit after submission.
      </Alert>

      <Grid container spacing={3}>
        {/* RMA Type Summary */}
        <Grid size={12}>
          <Paper sx={{ p: 2, bgcolor: rmaType === 'return' ? 'warning.50' : 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {rmaType === 'return' ?
                <Warning color="warning" /> :
                <CheckCircle color="primary" />
              }
              <Typography variant="h6">{getTypeLabel()}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Product Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Inventory /> Product Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Product"
                  secondary={formData.product?.name || "Not selected"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Serial Number"
                  secondary={formData.serialNumber || "Not provided"}
                />
              </ListItem>
              {formData.receiptNumber && (
                <ListItem>
                  <ListItemText
                    primary="Receipt Number"
                    secondary={formData.receiptNumber}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Issue Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Description /> Issue Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary="Reason"
                  secondary={getReasonLabel()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={formData.issueDescription || "No description"}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Attachments"
                  secondary={`${formData.attachments?.length || 0} file(s) ready to upload`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Purchase Information (for warranty) */}
        {(rmaType === 'warranty' || rmaType === 'repair') && (
          <Grid size={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Receipt /> Purchase Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Purchase Date"
                    secondary={formatDate(formData.purchaseDate)}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        )}

        {/* Contact Information */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Person /> Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography>{formData.contactName || "Not provided"}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography>{formData.contactEmail || "Not provided"}</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography>{formData.contactPhone || "Not provided"}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography>{formData.shippingAddress || "Not provided"}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Warranty Notice for Expired Warranty */}
        {rmaType === 'warranty' && formData.purchaseDate && (
          <Grid size={12}>
            <Alert severity="warning">
              Warranty claim submitted. Our team will verify your warranty status.
            </Alert>
          </Grid>
        )}

        {/* Return Policy Agreement */}
        <Grid size={12}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
            Return Policy
          </Typography>
          <Paper sx={{ p: 2, maxHeight: 150, overflow: 'auto', bgcolor: '#f8fafc', mb: 2, border: '1px solid #e2e8f0' }}>
            {loadingPolicy ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
            ) : (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                {policyText}
              </Typography>
            )}
          </Paper>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.policyAgreed || false}
                onChange={(e) => onChange('policyAgreed', e.target.checked)}
                color="primary"
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>I have read and agree to the Return Policy</Typography>}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RMAFormStep3;