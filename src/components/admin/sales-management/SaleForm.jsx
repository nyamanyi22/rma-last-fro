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
    Typography,
    Paper,
    CircularProgress,
    Autocomplete,
    Alert,
} from "@mui/material";
import {
    Save,
    Cancel,
    Receipt,
    Person,
    Inventory,
    CalendarMonth,
} from "@mui/icons-material";
import productService from "../../../services/api/productService";
import customerService from "../../../services/api/customerService";
import saleService from "../../../services/api/saleService";

const SaleForm = ({ sale, mode, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        invoiceNumber: "",
        customerId: "",
        productId: "",
        saleDate: new Date().toISOString().split("T")[0],
        quantity: 1,
        serialNumber: "",
        warrantyMonths: 12,
        paymentMethod: "",
        notes: "",
    });

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Fetch products for dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const response = await productService.getProducts({ per_page: 100, is_active: true });
                if (response.success) {
                    setProducts(response.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Fetch customers for dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            setCustomersLoading(true);
            try {
                // You'll need to create this endpoint
                const response = await customerService.getCustomers({ per_page: 100 });
                if (response.success) {
                    setCustomers(response.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch customers:", err);
            } finally {
                setCustomersLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // Pre-fill form if editing
    useEffect(() => {
        if (sale && mode === "edit") {
            setFormData({
                invoiceNumber: sale.invoiceNumber || "",
                customerId: sale.customerId || sale.customer?.id || "",
                productId: sale.productId || sale.product?.id || "",
                saleDate: sale.saleDate ? new Date(sale.saleDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                quantity: sale.quantity || 1,
                serialNumber: sale.serialNumber || "",
                warrantyMonths: sale.warrantyMonths || 12,
                paymentMethod: sale.paymentMethod || "",
                notes: sale.notes || "",
            });
        } else {
            // Reset for create mode
            setFormData({
                invoiceNumber: "",
                customerId: "",
                productId: "",
                saleDate: new Date().toISOString().split("T")[0],
                quantity: 1,
                serialNumber: "",
                warrantyMonths: 12,
                paymentMethod: "",
                notes: "",
            });
        }
        setErrors({});
    }, [sale, mode]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.invoiceNumber.trim()) {
            newErrors.invoiceNumber = "Invoice number is required";
        }

        if (!formData.customerId) {
            newErrors.customerId = "Customer selection is required";
        }

        if (!formData.productId) {
            newErrors.productId = "Product selection is required";
        }

        if (!formData.saleDate) {
            newErrors.saleDate = "Sale date is required";
        }

        if (formData.quantity < 1) {
            newErrors.quantity = "Quantity must be at least 1";
        }

        if (formData.serialNumber && formData.serialNumber.length > 100) {
            newErrors.serialNumber = "Serial number too long (max 100 chars)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const submitData = {
                invoiceNumber: formData.invoiceNumber,
                customerId: parseInt(formData.customerId),
                productId: parseInt(formData.productId),
                saleDate: formData.saleDate,
                quantity: parseInt(formData.quantity),
                serialNumber: formData.serialNumber || null,
                warrantyMonths: parseInt(formData.warrantyMonths),
                paymentMethod: formData.paymentMethod || null,
                notes: formData.notes || null,
            };

            onSave(submitData);
        }
    };

    // Get selected product details
    const selectedProduct = products.find(p => p.id === formData.productId);

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                {/* Order Information */}
                <Grid size={12}>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <Receipt />
                            Order Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Invoice Number *"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                                    size="small"
                                    helperText="Unique invoice/receipt number"
                                    required
                                    error={!!errors.invoiceNumber}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Payment Method"
                                    value={formData.paymentMethod}
                                    onChange={(e) => handleChange("paymentMethod", e.target.value)}
                                    size="small"
                                    helperText="e.g., Credit Card, Cash, Bank Transfer"
                                    placeholder="Optional"
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Customer Selection */}
                <Grid size={12}>
                    <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                        <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <Person />
                            Customer
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    options={customers}
                                    getOptionLabel={(option) =>
                                        `${option.first_name} ${option.last_name} (${option.email})`
                                    }
                                    value={customers.find(c => c.id === formData.customerId) || null}
                                    onChange={(_, newValue) => {
                                        handleChange("customerId", newValue ? newValue.id : "");
                                    }}
                                    loading={customersLoading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Customer *"
                                            error={!!errors.customerId}
                                            helperText={errors.customerId || "Search by name or email"}
                                            required
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {customersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Product Selection */}
                <Grid size={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <Inventory />
                            Product Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Autocomplete
                                    options={products}
                                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                                    value={products.find(p => p.id === formData.productId) || null}
                                    onChange={(_, newValue) => {
                                        handleChange("productId", newValue ? newValue.id : "");
                                        // Auto-set warranty months from product
                                        if (newValue?.warranty_months) {
                                            handleChange("warrantyMonths", newValue.warranty_months);
                                        }
                                    }}
                                    loading={productsLoading}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Product *"
                                            error={!!errors.productId}
                                            helperText={errors.productId || "Search by name or SKU"}
                                            required
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    label="Quantity *"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => handleChange("quantity", e.target.value)}
                                    error={!!errors.quantity}
                                    helperText={errors.quantity}
                                    required
                                    size="small"
                                    slotProps={{ htmlInput: { min: 1 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Serial Number"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleChange("serialNumber", e.target.value)}
                                    error={!!errors.serialNumber}
                                    helperText={errors.serialNumber || "Product serial number (optional)"}
                                    size="small"
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Warranty Period</InputLabel>
                                    <Select
                                        value={formData.warrantyMonths}
                                        onChange={(e) => handleChange("warrantyMonths", e.target.value)}
                                        label="Warranty Period"
                                    >
                                        <MenuItem value={6}>6 months</MenuItem>
                                        <MenuItem value={12}>12 months</MenuItem>
                                        <MenuItem value={24}>24 months</MenuItem>
                                        <MenuItem value={36}>36 months</MenuItem>
                                        <MenuItem value={48}>48 months</MenuItem>
                                        <MenuItem value={60}>60 months</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Product Info Preview */}
                        {selectedProduct && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    <strong>Selected Product:</strong> {selectedProduct.name}<br />
                                    <strong>Default Warranty:</strong> {selectedProduct.warranty_months} months
                                    {selectedProduct.price && (
                                        <> · <strong>Price:</strong> ${selectedProduct.price}</>
                                    )}
                                </Typography>
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Sale Date */}
                <Grid size={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <CalendarMonth />
                            Sale Information
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Date of Sale *"
                                    type="date"
                                    value={formData.saleDate}
                                    onChange={(e) => handleChange("saleDate", e.target.value)}
                                    error={!!errors.saleDate}
                                    helperText={errors.saleDate}
                                    required
                                    size="small"
                                    slotProps={{ label: { shrink: true } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => handleChange("notes", e.target.value)}
                                    size="small"
                                    placeholder="Additional notes about this sale (optional)"
                                />
                            </Grid>
                        </Grid>
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
                            {loading ? "Saving..." : mode === "create" ? "Create Sale" : "Update Sale"}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
export default SaleForm