import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Autocomplete,
    Alert,
    Stack,
    InputAdornment,
    Divider,
    Snackbar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Save,
    Cancel,
    ReceiptOutlined,
    PersonOutlined,
    Inventory2Outlined,
    CalendarMonthOutlined,
    NotesOutlined,
    AttachMoneyOutlined,
    LayersOutlined,
    WorkspacePremiumOutlined,
    CreditCardOutlined,
} from "@mui/icons-material";
import productService from "../../../services/api/productService";
import customerService from "../../../services/api/customerService";

const SaleForm = ({ sale, mode, onSave, onCancel, loading, errors: backendErrors = {} }) => {
    const [showToast, setShowToast] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: "",
        customerId: "",
        customerName: "",
        customerEmail: "",
        productId: "",
        saleDate: new Date().toISOString().split("T")[0],
        quantity: 1,
        serialNumber: "",
        amount: 0,
        warrantyMonths: 12,
        paymentMethod: "",
        notes: "",
    });

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState({});
    const [emailEdited, setEmailEdited] = useState(false);

    useEffect(() => {
        if (Object.keys(backendErrors).length > 0) setShowToast(true);
    }, [backendErrors]);

    useEffect(() => {
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const response = await productService.getProducts({ per_page: 100, is_active: true });
                if (response.success) setProducts(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const fetchCustomers = async () => {
            setCustomersLoading(true);
            try {
                const response = await customerService.getCustomers({ per_page: 100 });
                if (response.success) setCustomers(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
            } finally {
                setCustomersLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (sale && mode === "edit") {
            setFormData({
                invoiceNumber: sale.invoice_number || sale.invoiceNumber || "",
                customerId: sale.customer_id || sale.customerId || sale.customer?.id || "",
                customerName: sale.customer_name || sale.customerName || "",
                customerEmail: sale.customer_email || sale.customerEmail || "",
                productId: sale.product_id || sale.productId || sale.product?.id || "",
                saleDate: (sale.sale_date || sale.saleDate)
                    ? new Date(sale.sale_date || sale.saleDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                amount: sale.amount || 0,
                quantity: sale.quantity || 1,
                serialNumber: sale.serial_number || sale.serialNumber || "",
                warrantyMonths: sale.warranty_months || sale.warrantyMonths || 12,
                paymentMethod: sale.payment_method || sale.paymentMethod || "",
                notes: sale.notes || "",
            });
        } else {
            setFormData({
                invoiceNumber: "",
                customerId: "",
                customerName: "",
                customerEmail: "",
                productId: "",
                saleDate: new Date().toISOString().split("T")[0],
                amount: 0,
                quantity: 1,
                serialNumber: "",
                warrantyMonths: 12,
                paymentMethod: "",
                notes: "",
            });
        }
        setLocalErrors({});
    }, [sale, mode]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (localErrors[field]) {
            setLocalErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const getFieldError = (field) => {
        const fieldMap = {
            invoiceNumber: 'invoice_number',
            customerId: 'customer_id',
            customerEmail: 'customer_email',
            customerName: 'customer_name',
            productId: 'product_id',
            saleDate: 'sale_date',
            serialNumber: 'serial_number',
            warrantyMonths: 'warranty_months',
            paymentMethod: 'payment_method'
        };
        const backendKey = fieldMap[field] || field;
        return localErrors[field] || (backendErrors[backendKey] && backendErrors[backendKey][0]);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice number is required";
        if (!formData.customerId && !formData.customerName) newErrors.customerId = "Customer is required";
        if (!formData.customerEmail?.trim()) newErrors.customerEmail = "Email is required";
        if (!formData.productId) newErrors.productId = "Product is required";
        if (!formData.saleDate) newErrors.saleDate = "Sale date is required";
        if (formData.amount < 0) newErrors.amount = "Invalid amount";

        setLocalErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        if (!isValid) setShowToast(true);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = {
                ...formData,
                customerId: formData.customerId ? parseInt(formData.customerId) : null,
                productId: parseInt(formData.productId),
                amount: parseFloat(formData.amount) || 0,
                quantity: parseInt(formData.quantity) || 1,
                warrantyMonths: parseInt(formData.warrantyMonths),
            };
            onSave(submitData);
        }
    };

    const selectedProduct = products.find(p => p.id === formData.productId);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Snackbar
                open={showToast}
                autoHideDuration={6000}
                onClose={() => setShowToast(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowToast(false)} severity="error" sx={{ width: '100%', borderRadius: 2, fontWeight: 600, boxShadow: 3 }}>
                    There are validation errors with your submission. Please check the highlighted fields.
                </Alert>
            </Snackbar>
            <Stack spacing={4}>
                {/* Section 1: Order Context */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReceiptOutlined fontSize="small" /> Order Context
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Invoice Number"
                                value={formData.invoiceNumber}
                                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                                error={!!getFieldError("invoiceNumber")}
                                helperText={getFieldError("invoiceNumber")}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Date of Sale"
                                type="date"
                                value={formData.saleDate}
                                onChange={(e) => handleChange("saleDate", e.target.value)}
                                error={!!getFieldError("saleDate")}
                                helperText={getFieldError("saleDate")}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Payment Method"
                                value={formData.paymentMethod}
                                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CreditCardOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="">Unspecified</MenuItem>
                                <MenuItem value="Card">Credit/Debit Card</MenuItem>
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Transfer">Bank Transfer</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Section 2: Customer Entity */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonOutlined fontSize="small" /> Customer Entity
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Autocomplete
                                freeSolo
                                options={customers}
                                getOptionLabel={(option) => {
                                    if (typeof option === "string") return option;
                                    return `${option.first_name} ${option.last_name} (${option.email})`;
                                }}
                                value={customers.find(c => c.id === formData.customerId) || formData.customerName || ""}
                                onChange={(_, newValue) => {
                                    if (typeof newValue === "string") {
                                        handleChange("customerId", "");
                                        handleChange("customerName", newValue);
                                        if (!emailEdited) handleChange("customerEmail", "");
                                    } else if (newValue && newValue.id) {
                                        handleChange("customerId", newValue.id);
                                        handleChange("customerName", `${newValue.first_name} ${newValue.last_name}`);
                                        if (!emailEdited) handleChange("customerEmail", newValue.email);
                                    }
                                }}
                                loading={customersLoading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search or Select Customer"
                                        error={!!getFieldError("customerId")}
                                        helperText={getFieldError("customerId") || "Identify an existing customer or log a new entity"}
                                        required
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    {customersLoading && <CircularProgress size={16} color="inherit" />}
                                                    {params.InputProps.endAdornment}
                                                </Stack>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Customer Email"
                                value={formData.customerEmail}
                                onChange={(e) => {
                                    handleChange("customerEmail", e.target.value);
                                    setEmailEdited(true);
                                }}
                                error={!!getFieldError("customerEmail")}
                                helperText={getFieldError("customerEmail")}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {/* Section 3: Product Logistics */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Inventory2Outlined fontSize="small" /> Product Logistics
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <TextField
                                select
                                fullWidth
                                label="Catalog Product"
                                value={formData.productId}
                                onChange={(e) => handleChange("productId", e.target.value)}
                                error={!!getFieldError("productId")}
                                helperText={getFieldError("productId")}
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            >
                                <MenuItem value="">Select a product from inventory</MenuItem>
                                {products.map((product) => (
                                    <MenuItem key={product.id} value={product.id}>
                                        {product.name} — {product.sku}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Serial Number / Identifier"
                                value={formData.serialNumber}
                                onChange={(e) => handleChange("serialNumber", e.target.value)}
                                error={!!getFieldError("serialNumber")}
                                helperText={getFieldError("serialNumber") || "Optional product-specific serial"}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => handleChange("quantity", e.target.value)}
                                slotProps={{ htmlInput: { min: 1 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LayersOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Transaction Amount"
                                type="number"
                                value={formData.amount}
                                onChange={(e) => handleChange("amount", e.target.value)}
                                error={!!getFieldError("amount")}
                                helperText={getFieldError("amount")}
                                required
                                slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoneyOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Warranty Duration (Months)"
                                type="number"
                                value={formData.warrantyMonths}
                                onChange={(e) => handleChange("warrantyMonths", e.target.value)}
                                helperText="Standard is 12 months"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <WorkspacePremiumOutlined fontSize="small" sx={{ color: 'text.disabled' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* Section 4: Qualitative Data */}
                <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <NotesOutlined fontSize="small" /> Supplementary Metadata
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Internal Notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Log any specific details about this transaction..."
                        sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                </Box>

                {/* Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
                    <Button
                        size="large"
                        variant="outlined"
                        onClick={onCancel}
                        disabled={loading}
                        startIcon={<Cancel />}
                        sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 700 }}
                    >
                        Discard
                    </Button>
                    <Button
                        size="large"
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        sx={{
                            borderRadius: 3,
                            px: 5,
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3)'
                        }}
                    >
                        {loading ? "Persisting..." : "Synchronize Record"}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default SaleForm;
