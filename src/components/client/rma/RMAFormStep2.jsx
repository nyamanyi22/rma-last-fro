import React, { useRef } from "react";
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
} from "@mui/material";
import {
  AttachFile,
  Delete,
  Image,
  Description,
} from "@mui/icons-material";

// RMA Reasons based on type
const RETURN_REASONS = [
  { value: "shipping_damage", label: "Shipping Damage" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "defective_on_arrival", label: "Defective on Arrival (DOA)" },
  { value: "customer_return", label: "Change of Mind / Return" },
  { value: "other_return", label: "Other Return Reason" },
];

const WARRANTY_REASONS = [
  { value: "product_failure", label: "Product Failure / Not Working" },
  { value: "hardware_defect", label: "Hardware Defect" },
  { value: "software_issue", label: "Software Issue" },
  { value: "physical_damage", label: "Physical Damage (may affect warranty)" },
  { value: "performance_issue", label: "Performance Issue" },
  { value: "other_warranty", label: "Other Issue" },
];

const RMAFormStep2 = ({ formData, onChange, rmaType }) => {
  const fileInputRef = useRef(null);
  const reasons = rmaType === "return" ? RETURN_REASONS : WARRANTY_REASONS;

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isValidType && isValidSize;
    });

    const newAttachments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    onChange("attachments", [...formData.attachments, ...newAttachments]);
  };

  const handleRemoveFile = (id) => {
    const updatedAttachments = formData.attachments.filter(file => file.id !== id);
    onChange("attachments", updatedAttachments);
  };

  const handleDescriptionChange = (event) => {
    const description = event.target.value;
    onChange("issueDescription", description);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image color="primary" />;
    } else if (fileType === 'application/pdf') {
      return <Description color="error" />;
    } else {
      return <AttachFile />;
    }
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

      <Grid container spacing={4}>
        {/* Reason Selection */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth required>
            <InputLabel>Select Reason for RMA</InputLabel>
            <Select
              value={formData.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              label="Select Reason for RMA"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">
                <em>Select a reason</em>
              </MenuItem>
              {reasons.map((reason) => (
                <MenuItem key={reason.value} value={reason.value}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Issue Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Issue Description *"
            multiline
            rows={6}
            value={formData.issueDescription}
            onChange={handleDescriptionChange}
            required
            helperText={`${formData.issueDescription.length}/1000 characters. Please describe the issue in detail.`}
            inputProps={{ maxLength: 1000 }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Grid>

        {/* File Upload */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
            Proof of Issue / Documents
          </Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              bgcolor: 'grey.50',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <AttachFile sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.primary" gutterBottom>
              Click to Upload Files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: JPG, PNG, PDF (Max 5MB)
            </Typography>
          </Box>

          {/* Uploaded Files List */}
          {formData.attachments.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
              <List disablePadding>
                {formData.attachments.map((file, index) => (
                  <React.Fragment key={file.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.id); }}>
                          <Delete />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        {getFileIcon(file.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)}`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* Upload Requirements based on RMA type */}
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Required Documents:
            </Typography>
            <Typography variant="body2">
              {rmaType === "return" ? (
                <>
                  • Photo of damaged/wrong item<br />
                  • Delivery note/shipping label
                </>
              ) : (
                <>
                  • Purchase receipt/invoice (REQUIRED)<br />
                  • Photos showing the defect/issue<br />
                  • Serial number photo (if available)
                </>
              )}
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RMAFormStep2;
