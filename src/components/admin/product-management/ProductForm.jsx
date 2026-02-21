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
} from "@mui/material";
import {
  Save,
  Cancel,
  Numbers,
  Category,
  BrandingWatermark,
  AttachMoney,
  Inventory,
  CalendarMonth,
  Description,
} from "@mui/icons-material";

const ProductForm = ({ product, mode, onSave, onCancel, loading }) => {
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

  // Pre-fill form if editing
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
        specifications: product.specifications || "",
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    } else {
      // Reset for create mode
      setFormData({
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
    }
    setErrors({});
  }, [product, mode]);

  const categories = [
    "Laptop",
    "Desktop",
    "Monitor",
    "Accessory",
    "Printer",
    "Server",
    "Networking",
    "Storage",
    "Other",
  ];

  const brands = [
    "Dell",
    "HP",
    "Lenovo",
    "Apple",
    "Samsung",
    "Logitech",
    "Microsoft",
    "ASUS",
    "Acer",
    "Other",
  ];

  const warrantyOptions = [6, 12, 24, 36, 48, 60];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.brand) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.defaultWarrantyMonths || formData.defaultWarrantyMonths < 0) {
      newErrors.defaultWarrantyMonths = "Valid warranty period is required";
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        defaultWarrantyMonths: parseInt(formData.defaultWarrantyMonths),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      onSave(submitData);
    }
  };

  const handleSpecificationsChange = (e) => {
    const value = e.target.value;
    try {
      // Try to parse as JSON for validation
      if (value) {
        JSON.parse(value);
      }
      handleChange("specifications", value);
      setErrors(prev => ({ ...prev, specifications: "" }));
    } catch (error) {
      handleChange("specifications", value);
      setErrors(prev => ({ ...prev, specifications: "Invalid JSON format" }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={12}>
          <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Numbers />
              Basic Information
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="SKU *"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  error={!!errors.sku}
                  helperText={errors.sku || "Unique stock keeping unit"}
                  required
                  disabled={mode === "edit"}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name || "Full product name"}
                  required
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Category and Brand */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Category />
              Category & Brand
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }} error={!!errors.category}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                label="Category *"
              >
                <MenuItem value="">
                  <em>Select Category</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error">
                  {errors.category}
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth size="small" error={!!errors.brand}>
              <InputLabel>Brand *</InputLabel>
              <Select
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                label="Brand *"
              >
                <MenuItem value="">
                  <em>Select Brand</em>
                </MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
              {errors.brand && (
                <Typography variant="caption" color="error">
                  {errors.brand}
                </Typography>
              )}
            </FormControl>
          </Paper>
        </Grid>

        {/* Pricing & Warranty */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AttachMoney />
              Pricing & Warranty
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Price *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" error={!!errors.defaultWarrantyMonths}>
                  <InputLabel>Warranty Period *</InputLabel>
                  <Select
                    value={formData.defaultWarrantyMonths}
                    onChange={(e) => handleChange("defaultWarrantyMonths", e.target.value)}
                    label="Warranty Period *"
                  >
                    {warrantyOptions.map((months) => (
                      <MenuItem key={months} value={months}>
                        {months} months
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.defaultWarrantyMonths && (
                    <Typography variant="caption" color="error">
                      {errors.defaultWarrantyMonths}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Inventory */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Inventory />
              Inventory
            </Typography>

            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={formData.stockQuantity}
              onChange={(e) => handleChange("stockQuantity", e.target.value)}
              error={!!errors.stockQuantity}
              helperText={errors.stockQuantity || "Current stock level"}
              size="small"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  color="success"
                />
              }
              label="Product Active"
              sx={{ mt: 2 }}
            />
          </Paper>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Description />
              Description
            </Typography>

            <TextField
              fullWidth
              label="Product Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              size="small"
              helperText="Brief description of the product"
            />
          </Paper>
        </Grid>

        {/* Specifications (JSON) */}
        <Grid size={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Description />
              Specifications (JSON Format)
            </Typography>

            <TextField
              fullWidth
              label="Product Specifications"
              multiline
              rows={6}
              value={formData.specifications}
              onChange={handleSpecificationsChange}
              error={!!errors.specifications}
              helperText={errors.specifications || "Enter specifications as JSON (e.g., {\"cpu\": \"Intel i7\", \"ram\": \"16GB\"})"}
              size="small"
            />

            {formData.specifications && !errors.specifications && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Valid JSON format detected. Specifications will be stored as structured data.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Form Actions */}
        <Grid size={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              disabled={loading}
            >
              {loading ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;
