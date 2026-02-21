import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Cancel,
  Warning,
  Assignment,
  Receipt,
} from "@mui/icons-material";

const RMAReviewModal = ({ open, onClose, rma, onUpdateStatus }) => {
  const [decision, setDecision] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [warrantyValid, setWarrantyValid] = useState(rma.warrantyValid || null);
  const [loading, setLoading] = useState(false);

  if (!rma) return null;

  const handleSubmit = () => {
    if (!decision) {
      alert("Please make a decision (Approve or Reject)");
      return;
    }

    if (decision === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setLoading(true);

    // Prepare update data
    const updateData = {
      status: decision === "approve" ? "approved" : "rejected",
      warrantyValid: rma.requiresWarrantyCheck ? warrantyValid : null,
      notes: notes.trim(),
      rejectionReason: decision === "reject" ? rejectionReason : null,
    };

    // Simulate API call
    setTimeout(() => {
      onUpdateStatus(rma.id, updateData.status, updateData.notes);
      setLoading(false);
      resetForm();
    }, 1500);
  };

  const resetForm = () => {
    setDecision("");
    setRejectionReason("");
    setNotes("");
    setWarrantyValid(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getRejectionReasons = () => {
    const commonReasons = [
      "Insufficient proof of issue",
      "Product outside warranty period",
      "Customer-induced damage",
      "Missing required documents",
      "Return period expired",
      "Product not purchased from authorized dealer",
      "Issue not covered under warranty",
      "Other (specify in notes)",
    ];

    if (rma.rmaType === "return") {
      return [
        "Return period expired (beyond 14 days)",
        "Missing original packaging",
        "Product used/opened",
        ...commonReasons,
      ];
    }

    return commonReasons;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment />
            <Typography variant="h6">
              Review RMA: {rma.rmaNumber}
            </Typography>
          </Box>
          <Button onClick={handleClose} size="small">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Quick Summary */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><strong>Customer:</strong> {rma.customerName}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><strong>Product:</strong> {rma.productName}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2"><strong>Type:</strong> 
                <Chip
                  label={rma.rmaType === "return" ? "Return" : "Warranty"}
                  size="small"
                  sx={{ ml: 1 }}
                  color={rma.rmaType === "return" ? "primary" : "secondary"}
                />
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Warranty Validation (if applicable) */}
        {rma.requiresWarrantyCheck && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Warranty Validation
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              This is a warranty claim. Please validate the warranty status.
            </Alert>
            
            <RadioGroup
              row
              value={warrantyValid === null ? "" : warrantyValid.toString()}
              onChange={(e) => setWarrantyValid(e.target.value === "true")}
            >
              <FormControlLabel
                value="true"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircle color="success" />
                    <Typography>Warranty Valid</Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Cancel color="error" />
                    <Typography>Warranty Expired</Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {warrantyValid === false && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Warranty is expired. Customer may need to pay for repair/replacement.
              </Alert>
            )}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Decision */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Decision
          </Typography>
          <RadioGroup
            row
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <FormControlLabel
              value="approve"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle color="success" />
                  <Typography>Approve RMA</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="reject"
              control={<Radio />}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Cancel color="error" />
                  <Typography>Reject RMA</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Rejection Reason (if rejecting) */}
        {decision === "reject" && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Rejection Reason
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Reason</InputLabel>
              <Select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                label="Select Reason"
              >
                <MenuItem value="">
                  <em>Select a reason</em>
                </MenuItem>
                {getRejectionReasons().map((reason, index) => (
                  <MenuItem key={index} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              This reason will be shared with the customer.
            </Typography>
          </Box>
        )}

        {/* Internal Notes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Internal Notes
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add internal notes for other team members..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            These notes are only visible to admin staff.
          </Typography>
        </Box>

        {/* Validation Warnings */}
        {decision === "approve" && rma.requiresWarrantyCheck && warrantyValid === null && (
          <Alert severity="warning">
            Please validate warranty status before approving.
          </Alert>
        )}

        {decision === "approve" && !rma.requiresWarrantyCheck && (
          <Alert severity="info">
            This is a simple return. No warranty validation needed.
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !decision}
          startIcon={decision === "approve" ? <CheckCircle /> : <Cancel />}
          color={decision === "approve" ? "success" : "error"}
        >
          {loading ? "Processing..." : `Confirm ${decision === "approve" ? "Approval" : "Rejection"}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RMAReviewModal;
