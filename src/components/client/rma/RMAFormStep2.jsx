import React, { useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Paper,
  Divider,
  Chip,
  FormHelperText
} from "@mui/material";
import {
  AttachFile,
  Delete,
  Image,
  Description,
  Warning
} from "@mui/icons-material";

// RMA Reasons based on type
const REASONS = {
  simple_return: [
    { value: "shipping_damage", label: "Shipping Damage", description: "Item damaged during shipping" },
    { value: "wrong_item", label: "Wrong Item Received", description: "Received different product than ordered" },
    { value: "defective_on_arrival", label: "Defective on Arrival (DOA)", description: "Product didn't work when received" },
    { value: "customer_return", label: "Change of Mind", description: "No longer want/need the item" },
    { value: "other_return", label: "Other Return Reason", description: "Other reason not listed" },
  ],
  warranty_repair: [
    { value: "product_failure", label: "Product Failure", description: "Product stopped working" },
    { value: "hardware_defect", label: "Hardware Defect", description: "Physical component issue" },
    { value: "software_issue", label: "Software Issue", description: "Software/OS problems" },
    { value: "performance_issue", label: "Performance Issue", description: "Slow or not performing as expected" },
    { value: "physical_damage", label: "Physical Damage", description: "Accidental damage (may not be covered)" },
    { value: "other_warranty", label: "Other Issue", description: "Other issue not listed" },
  ]
};

const RMAFormStep2 = ({ formData, onChange, rmaType, errors = {} }) => {
  const fileInputRef = useRef(null);
  const reasons = REASONS[rmaType] || REASONS.simple_return;

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (formData.attachments) {
        formData.attachments.forEach(att => {
          if (att.preview) {
            URL.revokeObjectURL(att.preview);
          }
        });
      }
    };
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert("Some files were skipped. Only JPG, PNG, PDF files under 5MB are allowed.");
    }

    // Store ONLY the File objects, create preview URLs for display
    const newAttachments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file, // ✅ This is what matters for upload!
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    onChange("attachments", [...formData.attachments, ...newAttachments]);

    // Clear input
    event.target.value = '';
  };

  const handleRemoveFile = (id) => {
    // Clean up preview URL to avoid memory leaks
    const fileToRemove = formData.attachments.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updated = formData.attachments.filter(f => f.id !== id);
    onChange("attachments", updated);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image color="primary" />;
    if (fileType === 'application/pdf') return <Description color="error" />;
    return <AttachFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Step 2: Describe Issue & Upload Proof
      </Typography>

      <Grid container spacing={3}>
        {/* Reason Selection */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth required error={!!errors.reason}>
            <InputLabel>Reason for {rmaType === 'return' ? 'Return' : rmaType === 'warranty' ? 'Warranty Claim' : 'Repair'}</InputLabel>
            <Select
              value={formData.reason || ""}
              onChange={(e) => onChange("reason", e.target.value)}
              label={`Reason for ${rmaType === 'return' ? 'Return' : rmaType === 'warranty' ? 'Warranty Claim' : 'Repair'}`}
            >
              <MenuItem value="">
                <em>Select a reason</em>
              </MenuItem>
              {reasons.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
                  <Box>
                    <Typography variant="body2">{reason.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reason.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {errors.reason && <FormHelperText error>{errors.reason}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Issue Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Describe the Issue *"
            multiline
            rows={4}
            value={formData.issueDescription || ""}
            onChange={(e) => onChange("issueDescription", e.target.value)}
            required
            error={!!errors.issueDescription}
            helperText={errors.issueDescription || `${formData.issueDescription?.length || 0}/500 characters. Please be detailed.`}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>

        {/* File Upload Area */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            Supporting Documents
          </Typography>

          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'grey.50',
              borderStyle: 'dashed',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.100' }
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <AttachFile sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1">Click to upload files</Typography>
            <Typography variant="caption" color="text.secondary">
              Supported: JPG, PNG, PDF (Max 5MB each)
            </Typography>
          </Paper>

          {/* Uploaded Files List */}
          {formData.attachments?.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2 }}>
              <List dense>
                {formData.attachments.map((file, index) => (
                  <React.Fragment key={file.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveFile(file.id)}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      {file.preview && (
                        <Box
                          component="img"
                          src={file.preview}
                          sx={{ width: 40, height: 40, objectFit: 'cover', ml: 2, borderRadius: 1 }}
                          alt="preview"
                        />
                      )}
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* Requirements Info */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Required Documents:</Typography>
            <Typography variant="body2">
              {rmaType === "return" ? (
                "• Photo of item/damage • Delivery note (if available)"
              ) : (
                "• Purchase receipt/invoice • Photos showing the issue"
              )}
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RMAFormStep2;