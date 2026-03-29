import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Chip,
  Divider,
  Tooltip,
  FormHelperText
} from "@mui/material";
import { InfoOutlined, CheckCircle, Warning } from "@mui/icons-material";
import productService from "../../../services/api/productService";
import saleService from "../../../services/api/saleService";

const RMAFormStep1 = ({ formData, onChange, errors = {} }) => {
  const [products, setProducts] = useState([]);
  const [userSales, setUserSales] = useState([]);
  const [loading, setLoading] = useState({
    products: false,
    sales: false
  });
  const [error, setError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch user's sales when type changes to warranty/repair
  useEffect(() => {
    if (formData.rmaType === 'warranty_repair') {
      fetchUserSales();
    } else {
      // Clear sale selection when switching to return
      setSelectedSale(null);
    }
  }, [formData.rmaType]);

  // Update selectedSale when saleId changes
  useEffect(() => {
    if (formData.saleId) {
      const sale = userSales.find(s => s.id === formData.saleId);
      setSelectedSale(sale);

      // Auto-fill product from selected sale
      if (sale?.product) {
        onChange("productId", sale.product.id);
        onChange("product", sale.product);
      }
    } else {
      setSelectedSale(null);
    }
  }, [formData.saleId, userSales]);

  const fetchProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }));
    try {
      const response = await productService.getProducts({ is_active: true });
      if (response.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };

  const fetchUserSales = async () => {
    setLoading(prev => ({ ...prev, sales: true }));
    try {
      const response = await saleService.getMySales();

      if (response?.success) {
        let salesData = [];
        if (Array.isArray(response.data)) {
          salesData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          salesData = response.data.data;
        }

        setUserSales(salesData);
      } else {
        console.error('Failed to fetch sales:', response?.message || 'Unknown error');
        setUserSales([]);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setUserSales([]);
    } finally {
      setLoading(prev => ({ ...prev, sales: false }));
    }
  };

  const handleRMATypeChange = (event) => {
    const type = event.target.value;
    onChange("rmaType", type);

    // Clear warranty-specific fields if switching to return
    if (type === "simple_return") {
      onChange("saleId", "");
      onChange("purchaseDate", "");
      onChange("receiptNumber", "");
      onChange("serialNumber", "");
      setSelectedSale(null);
    }
  };

  const handleSaleChange = (event) => {
    const saleId = event.target.value;
    onChange("saleId", saleId);
  };

  const handleProductChange = (event) => {
    const id = event.target.value;
    const product = products.find(p => p.id === id);
    onChange("productId", id);
    onChange("product", product);
  };

  const selectedProduct = products.find(p => p.id === formData.productId);
  const isWarrantyType = formData.rmaType === 'warranty_repair';

  // Calculate warranty status for a sale
  const getWarrantyStatus = (sale) => {
    if (!sale?.warranty_expiry_date) return null;
    const expiryDate = new Date(sale.warranty_expiry_date);
    const now = new Date();
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysLeft > 30) return { status: 'active', color: 'success', text: 'Active' };
    if (daysLeft > 0) return { status: 'expiring', color: 'warning', text: `Expires in ${daysLeft} days` };
    return { status: 'expired', color: 'error', text: 'Expired' };
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Step 1: Select RMA Type & Product
      </Typography>

      {/* RMA Type Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom color="text.secondary" sx={{ mb: 2 }}>
          WHAT TYPE OF REQUEST IS THIS?
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              onClick={() => handleRMATypeChange({ target: { value: 'simple_return' } })}
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: formData.rmaType === 'simple_return' ? 'primary.main' : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: formData.rmaType === 'simple_return' ? 'primary.50' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
                transition: 'all 0.2s'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Radio checked={formData.rmaType === 'simple_return'} value="simple_return" />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
                  Simple Return
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Wrong item, damaged, DOA, changed mind
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              onClick={() => handleRMATypeChange({ target: { value: 'warranty_repair' } })}
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: formData.rmaType === 'warranty_repair' ? 'primary.main' : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: formData.rmaType === 'warranty_repair' ? 'primary.50' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                },
                transition: 'all 0.2s'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Radio checked={formData.rmaType === 'warranty_repair'} value="warranty_repair" />
                <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
                  Warranty / Repair
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Product failure, defect, repair needed
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {isWarrantyType && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlined />
              <Typography variant="body2">
                Warranty claims require purchase verification. Select your purchase below.
              </Typography>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Main Form Grid */}
      <Grid container spacing={3}>
        {/* Purchase Selection (Warranty only) */}
        {isWarrantyType && (
          <Grid size={12}>
            <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Select Your Purchase
              </Typography>

              <FormControl fullWidth required sx={{ mb: 2 }} error={!!errors.saleId}>
                <InputLabel>Choose a purchase</InputLabel>
                <Select
                  value={formData.saleId}
                  onChange={handleSaleChange}
                  label="Choose a purchase"
                  disabled={loading.sales}
                >
                  <MenuItem value="">
                    <em>-- Select a purchase --</em>
                  </MenuItem>
                  {userSales.map((sale) => {
                    const warranty = getWarrantyStatus(sale);
                    return (
                      <MenuItem key={sale.id} value={sale.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box>
                            <Typography variant="body2">
                              {sale.product?.name} - {new Date(sale.sale_date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Invoice: {sale.invoice_number}
                            </Typography>
                          </Box>
                          {warranty && (
                            <Chip
                              size="small"
                              label={warranty.text}
                              color={warranty.color}
                              sx={{ ml: 2 }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
                {errors.saleId && <FormHelperText error>{errors.saleId}</FormHelperText>}
              </FormControl>

              {loading.sales && <CircularProgress size={24} sx={{ mt: 1 }} />}

              {userSales.length === 0 && !loading.sales && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  No purchases found. If you've made a purchase, please contact support.
                </Alert>
              )}

              {/* Selected Purchase Summary */}
              {selectedSale && (
                <Paper sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom color="primary">
                    Selected Purchase Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Product</Typography>
                      <Typography variant="body2">{selectedSale.product?.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Purchase Date</Typography>
                      <Typography variant="body2">
                        {new Date(selectedSale.sale_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Invoice</Typography>
                      <Typography variant="body2">{selectedSale.invoice_number}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Warranty</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {selectedSale.warranty_months} months
                        </Typography>
                        {selectedSale.warranty_expiry_date && (
                          <Chip
                            size="small"
                            label={`Expires: ${new Date(selectedSale.warranty_expiry_date).toLocaleDateString()}`}
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Paper>
          </Grid>
        )}

        {/* Product Selection */}
        <Grid size={12}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Product Information
            </Typography>

            <FormControl fullWidth required sx={{ mb: 2 }} error={!!errors.productId}>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={formData.productId}
                onChange={handleProductChange}
                label="Select Product"
                disabled={loading.products || (isWarrantyType && !!selectedSale)}
              >
                <MenuItem value="">
                  <em>-- Select a product --</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    <Box>
                      <Typography variant="body2">{product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {product.sku} | Warranty: {product.warranty_months || 12} months
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.productId && <FormHelperText error>{errors.productId}</FormHelperText>}
            </FormControl>

            {loading.products && <CircularProgress size={24} sx={{ mt: 1 }} />}

            {/* Product Details */}
            {selectedProduct && (
              <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="subtitle2" color="primary.main">
                    Product Selected
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography variant="body2">{selectedProduct.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">SKU</Typography>
                    <Typography variant="body2">{selectedProduct.sku}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">Warranty Period</Typography>
                    <Typography variant="body2">{selectedProduct.warranty_months || 12} months</Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Paper>
        </Grid>

        {/* Serial Number */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Serial Number (Optional)"
            value={formData.serialNumber}
            onChange={(e) => onChange("serialNumber", e.target.value)}
            helperText="Located on the product or packaging"
            variant="outlined"
          />
        </Grid>

        {/* Receipt Number (Warranty only) */}
        {isWarrantyType && (
          <Grid size={12}>
            <TextField
              fullWidth
              label="Receipt/Invoice Number (Optional)"
              value={formData.receiptNumber}
              onChange={(e) => onChange("receiptNumber", e.target.value)}
              helperText="Enter if you have a different receipt number"
              variant="outlined"
            />
          </Grid>
        )}

        {/* Warranty Status Message */}
        {isWarrantyType && selectedSale && selectedSale.warranty_expiry_date && (
          <Grid size={12}>
            <Alert
              severity={new Date(selectedSale.warranty_expiry_date) > new Date() ? "success" : "warning"}
              icon={new Date(selectedSale.warranty_expiry_date) > new Date() ? <CheckCircle /> : <Warning />}
            >
              {new Date(selectedSale.warranty_expiry_date) > new Date() ? (
                <Typography variant="body2">
                  ✅ This product is under warranty until {new Date(selectedSale.warranty_expiry_date).toLocaleDateString()}
                </Typography>
              ) : (
                <Typography variant="body2">
                  ⚠️ This product's warranty expired on {new Date(selectedSale.warranty_expiry_date).toLocaleDateString()}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default RMAFormStep1;