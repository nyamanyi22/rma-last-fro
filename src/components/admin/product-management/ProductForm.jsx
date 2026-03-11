import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  InputAdornment,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Save,
  Cancel,
  Inventory2,
  AttachMoney,
  GppGood,
  InfoOutlined,
  Translate,
  DescriptionOutlined,
  CodeOutlined,
  BookmarkBorder,
} from "@mui/icons-material";

const FormSection = ({ title, icon: Icon, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: 4,
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      height: '100%',
      bgcolor: alpha('#f8f9fa', 0.5)
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex'
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
        {title}
      </Typography>
    </Stack>
    {children}
  </Paper>
);

const ProductForm = ({ product, mode, onSave, onCancel, loading, categories, brands }) => {
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    price: "",
    defaultWarrantyMonths: 12,
    stockQuantity: 0,
    description: "",
    specifications: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        sku: product.sku || "",
        name: product.name || "",
        category: product.category || "",
        brand: product.brand || "",
        price: product.price?.toString() || "",
        defaultWarrantyMonths: product.defaultWarrantyMonths || 12,
        stockQuantity: product.stockQuantity || 0,
        description: product.description || "",
        specifications: typeof product.specifications === 'string' ? product.specifications : JSON.stringify(product.specifications, null, 2) || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    }
  }, [product, mode]);

  const warrantyOptions = [6, 12, 18, 24, 36, 48, 60];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) newErrors.price = "Price must be > 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        price: parseFloat(formData.price),
        defaultWarrantyMonths: parseInt(formData.defaultWarrantyMonths),
        stockQuantity: parseInt(formData.stockQuantity),
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ py: 2 }}>
      <Grid container spacing={4}>
        {/* Core Info */}
        <Grid size={12}>
          <FormSection title="Core Information" icon={InfoOutlined}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Product SKU"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  error={!!errors.sku}
                  helperText={errors.sku}
                  disabled={mode === "edit"}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontWeight: 700, fontFamily: 'monospace' } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BookmarkBorder fontSize="small" /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Product Listing Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              </Grid>
            </Grid>
          </FormSection>
        </Grid>

        {/* Classification */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSection title="Classification" icon={Translate}>
            <Stack spacing={3}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  label="Category"
                  sx={{ borderRadius: 3 }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                {errors.category && <Typography variant="caption" color="error" sx={{ mx: 2, mt: 0.5 }}>{errors.category}</Typography>}
              </FormControl>

              <FormControl fullWidth error={!!errors.brand}>
                <InputLabel>Brand / Manufacturer</InputLabel>
                <Select
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  label="Brand / Manufacturer"
                  sx={{ borderRadius: 3 }}
                >
                  {brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </FormSection>
        </Grid>

        {/* Logistics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSection title="Logistics & Value" icon={AttachMoney}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Sales Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                error={!!errors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  sx: { borderRadius: 3, fontWeight: 800 }
                }}
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Current Stock"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleChange("stockQuantity", e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Inventory2 fontSize="small" /></InputAdornment>,
                      sx: { borderRadius: 3 }
                    }}
                  />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Warranty</InputLabel>
                    <Select
                      value={formData.defaultWarrantyMonths}
                      onChange={(e) => handleChange("defaultWarrantyMonths", e.target.value)}
                      label="Warranty"
                      sx={{ borderRadius: 3 }}
                    >
                      {warrantyOptions.map((m) => <MenuItem key={m} value={m}>{m} Months</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Stack>
          </FormSection>
        </Grid>

        {/* Content */}
        <Grid size={{ xs: 12, md: 7 }}>
          <FormSection title="Product Description" icon={DescriptionOutlined}>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Provide a detailed description of the product features..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.paper' } }}
            />
          </FormSection>
        </Grid>

        {/* Visibility */}
        <Grid size={{ xs: 12, md: 5 }}>
          <FormSection title="Catalog Visibility" icon={GppGood}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <FormControlLabel
                control={<Switch checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} color="success" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Active Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle whether this product is visible in search and checkout.
                    </Typography>
                  </Box>
                }
              />
            </Box>
            <Alert severity="info" sx={{ mt: 3, borderRadius: 3 }}>
              Deactivating a product will hide it from customer views but preserve history.
            </Alert>
          </FormSection>
        </Grid>

        {/* Technical Specs */}
        <Grid size={12}>
          <FormSection title="Technical Specifications" icon={CodeOutlined}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder='{"model": "v2", "variant": "pro"}'
              value={formData.specifications}
              onChange={(e) => handleChange("specifications", e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  bgcolor: alpha('#263238', 0.02)
                }
              }}
              helperText="Enter valid JSON for structured technical data."
            />
          </FormSection>
        </Grid>

        {/* Actions */}
        <Grid size={12}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="text"
              onClick={onCancel}
              disabled={loading}
              sx={{ p: 1.5, px: 4, borderRadius: 3, fontWeight: 700, textTransform: 'none' }}
              startIcon={<Cancel />}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                p: 1.5, px: 6,
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 24px -6px rgba(25, 118, 210, 0.4)'
              }}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            >
              {loading ? "Processing..." : mode === "create" ? "Launch Product" : "Save Updates"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
