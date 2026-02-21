import React from "react";
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Paper,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Mock products database
const MOCK_PRODUCTS = [
  { id: 1, name: "Dell XPS 13 Laptop", sku: "DEL-XPS13-2024", category: "Laptop", warrantyMonths: 12 },
  { id: 2, name: "HP Pavilion Desktop", sku: "HP-PAV-001", category: "Desktop", warrantyMonths: 24 },
  { id: 3, name: "Logitech MX Master 3", sku: "LOG-MX3", category: "Accessory", warrantyMonths: 12 },
  { id: 4, name: "Samsung 27\" Monitor", sku: "SAM-MON27", category: "Monitor", warrantyMonths: 36 },
  { id: 5, name: "Apple MacBook Pro 14\"", sku: "APP-MBP14", category: "Laptop", warrantyMonths: 12 },
];

const RMAFormStep1 = ({ formData, onChange }) => {
  const selectedProduct = MOCK_PRODUCTS.find(p => p.id.toString() === formData.productId);

  const handleRMATypeChange = (type) => {
    onChange("rmaType", type);

    // Clear warranty-specific fields if switching to simple return
    if (type === "return") {
      onChange("purchaseDate", "");
      onChange("receiptNumber", "");
      onChange("serialNumber", "");
    }
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    onChange("productId", productId);
  };

  const handleDateChange = (date) => {
    onChange("purchaseDate", date ? date.toISOString().split('T')[0] : "");
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Step 1: Select Type & Product
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
          WHAT TYPE OF REQUEST IS THIS?
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              onClick={() => handleRMATypeChange('return')}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: formData.rmaType === 'return' ? 'primary.main' : 'divider',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: formData.rmaType === 'return' ? 'primary.lighter' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Radio
                  checked={formData.rmaType === 'return'}
                  onChange={() => handleRMATypeChange('return')}
                  value="return"
                />
                <Typography variant="h6" fontWeight="bold">Simple Return</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                For returns within 14 days, wrong items, or shipping damage.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              onClick={() => handleRMATypeChange('warranty')}
              sx={{
                p: 3,
                border: '2px solid',
                borderColor: formData.rmaType === 'warranty' ? 'primary.main' : 'divider',
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                bgcolor: formData.rmaType === 'warranty' ? 'primary.lighter' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Radio
                  checked={formData.rmaType === 'warranty'}
                  onChange={() => handleRMATypeChange('warranty')}
                  value="warranty"
                />
                <Typography variant="h6" fontWeight="bold">Warranty Claim</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                For product defects, repairs, or replacements under warranty.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {formData.rmaType === "warranty" && (
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            Warranty claims require purchase verification. Please have your receipt ready.
          </Alert>
        )}
      </Box>

      <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
        PRODUCT DETAILS
      </Typography>

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Select Product</InputLabel>
            <Select
              value={formData.productId}
              onChange={handleProductChange}
              label="Select Product"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">
                <em>Select a product</em>
              </MenuItem>
              {MOCK_PRODUCTS.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedProduct && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.100' }}>
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Selected: {selectedProduct.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                SKU: {selectedProduct.sku} • Warranty: {selectedProduct.warrantyMonths} months
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Serial Number */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Serial Number (Optional)"
            value={formData.serialNumber}
            onChange={(e) => onChange("serialNumber", e.target.value)}
            helperText="Located on the product or packaging"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Grid>

        {/* Warranty-specific fields (only show for warranty claims) */}
        {formData.rmaType === "warranty" && (
          <>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date *"
                  value={formData.purchaseDate ? new Date(formData.purchaseDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Receipt/Invoice Number"
                value={formData.receiptNumber}
                onChange={(e) => onChange("receiptNumber", e.target.value)}
                helperText="From your purchase receipt"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default RMAFormStep1;
