import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Search,
  Add,
  Delete,
  Refresh,
  Download,
  FilterList,
  CheckCircle,
  Cancel,
  Inventory2,
  CheckCircleOutline,
  ErrorOutline,
  CategoryOutlined,
} from "@mui/icons-material";
import ProductTable from "../../components/admin/product-management/ProductTable";
import ProductForm from "../../components/admin/product-management/ProductForm";
import ProductService from "../../services/api/productService";

const GlassCard = ({ children, bgcolor, icon: Icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
      background: (theme) => `linear-gradient(135deg, ${alpha(bgcolor, 0.1)} 0%, ${alpha(bgcolor, 0.05)} 100%)`,
      border: '1px solid',
      borderColor: (theme) => alpha(bgcolor, 0.2),
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => `0 12px 24px -10px ${alpha(bgcolor, 0.3)}`,
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="overline" sx={{ color: color, fontWeight: 700, letterSpacing: 1 }}>
          {label}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(bgcolor, 0.2),
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon fontSize="large" />
      </Box>
    </Box>
    {/* Subtle Background Pattern */}
    <Box
      sx={{
        position: 'absolute',
        bottom: -20,
        right: -20,
        opacity: 0.05,
        transform: 'rotate(-15deg)',
      }}
    >
      <Icon sx={{ fontSize: 120 }} />
    </Box>
  </Paper>
);

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [categories, setCategories] = useState(["all"]);
  const [brands, setBrands] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    categories: 0,
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        is_active: selectedStatus !== "all" ? (selectedStatus === "active") : undefined,
      };

      const response = await ProductService.getProducts(params);

      if (response.success) {
        setProducts(response.data.data);
        setTotalCount(response.data.total);

        // Fetch all products for accurate stats (or handle via backend if possible)
        const allRes = await ProductService.getProducts({ per_page: 999 });
        if (allRes.success) {
          const allProducts = allRes.data.data;
          setStats({
            total: allRes.data.total,
            active: allProducts.filter(p => p.isActive).length,
            outOfStock: allProducts.filter(p => p.stockQuantity === 0).length,
            categories: new Set(allProducts.map(p => p.category)).size
          });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        ProductService.getCategories(),
        ProductService.getBrands(),
      ]);

      if (categoriesRes.success) {
        setCategories(["all", ...(categoriesRes.data || [])]);
      }
      if (brandsRes.success) {
        setBrands(brandsRes.data || []);
      }
    } catch (err) {
      console.error('Filter Load Error:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadFilters();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await ProductService.deleteProduct(productId);
        setSuccessMessage("Product deleted successfully");
        loadProducts();
      } catch (err) {
        setErrorMessage(err.message || "Failed to delete product");
      } finally {
        setLoading(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setLoading(true);
    try {
      await ProductService.updateProduct(productId, {
        ...product,
        isActive: !product.isActive,
      });
      setSuccessMessage(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`);
      loadProducts();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update product status");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleSaveProduct = async (productData) => {
    setLoading(true);
    try {
      if (dialogMode === "create") {
        await ProductService.createProduct(productData);
        setSuccessMessage("Product created successfully");
      } else {
        await ProductService.updateProduct(selectedProduct.id, productData);
        setSuccessMessage("Product updated successfully");
      }
      setDialogOpen(false);
      loadProducts();
      loadFilters();
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${dialogMode} product`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["SKU", "Name", "Category", "Brand", "Price", "Warranty", "Stock", "Status"],
      ...products.map(p => [
        p.sku,
        p.name,
        p.category,
        p.brand,
        `$${p.price}`,
        `${p.defaultWarrantyMonths} months`,
        p.stockQuantity,
        p.isActive ? "Active" : "Inactive",
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      setLoading(true);
      try {
        await ProductService.bulkDeleteProducts(selectedIds);
        setSuccessMessage("Products deleted successfully");
        setSelectedIds([]);
        loadProducts();
      } catch (err) {
        setErrorMessage(err.message || "Failed to delete products");
      } finally {
        setLoading(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    setLoading(true);
    try {
      await ProductService.bulkUpdateStatus(selectedIds, status);
      setSuccessMessage(`Products ${status ? "activated" : "deactivated"} successfully`);
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${status ? "activate" : "deactivate"} products`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Product Inventory
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Manage your store's catalog and monitor stock levels
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={handleCreateProduct}
          sx={{
            py: 1.5, px: 4,
            borderRadius: 3,
            textTransform: 'none',
            fontSize: '1.05rem',
            fontWeight: 700,
            boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3)',
          }}
        >
          New Product
        </Button>
      </Box>

      {/* Stats Dashboard */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard label="Total Products" value={stats.total} icon={Inventory2} bgcolor="#1976d2" color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard label="Active Catalog" value={stats.active} icon={CheckCircleOutline} bgcolor="#2e7d32" color="#2e7d32" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard label="Stock Alerts" value={stats.outOfStock} icon={ErrorOutline} bgcolor="#d32f2f" color="#d32f2f" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <GlassCard label="Category Spread" value={stats.categories} icon={CategoryOutlined} bgcolor="#9c27b0" color="#9c27b0" />
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        {/* Toolbar & Filters */}
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search by name, SKU..."
              value={searchQuery}
              onChange={handleSearch}
              sx={{
                flexGrow: 1,
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'grey.50',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Catalog">
                <IconButton onClick={() => loadProducts()} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download CSV">
                <IconButton onClick={handleExport} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
                sx={{ borderRadius: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>

            {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
              <Button
                size="small"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                startIcon={<FilterList />}
                sx={{ borderRadius: 2 }}
              >
                Reset Filters
              </Button>
            )}
          </Box>
        </Stack>

        {/* Notifications */}
        <Fade in={!!successMessage || !!errorMessage}>
          <Box sx={{ mb: 3 }}>
            {successMessage && <Alert severity="success" sx={{ borderRadius: 2 }}>{successMessage}</Alert>}
            {errorMessage && <Alert severity="error" sx={{ borderRadius: 2 }}>{errorMessage}</Alert>}
          </Box>
        </Fade>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {selectedIds.length} Items Selected
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<CheckCircle />} onClick={() => handleBulkStatusUpdate(true)}>Activate</Button>
              <Button size="small" color="warning" startIcon={<Cancel />} onClick={() => handleBulkStatusUpdate(false)}>Deactivate</Button>
              <Button size="small" color="error" variant="contained" startIcon={<Delete />} onClick={handleBulkDelete}>Delete Selected</Button>
            </Stack>
          </Box>
        )}

        {/* Table Wrapper */}
        <Box sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, borderRadius: 3
            }}>
              <CircularProgress />
            </Box>
          )}

          <ProductTable
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onToggleStatus={handleToggleStatus}
            selectedIds={selectedIds}
            onSelectAll={(event) => {
              if (event.target.checked) setSelectedIds(products.map(p => p.id));
              else setSelectedIds([]);
            }}
            onSelectRow={(id) => {
              const selectedIndex = selectedIds.indexOf(id);
              if (selectedIndex === -1) setSelectedIds([...selectedIds, id]);
              else setSelectedIds(selectedIds.filter(item => item !== id));
            }}
          />
        </Box>

        {/* Custom Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Showing <b>{products.length}</b> of <b>{totalCount}</b> products
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Previous
            </Button>
            <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {page + 1} / {Math.ceil(totalCount / rowsPerPage) || 1}
              </Typography>
            </Box>
            <Button
              disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
              onClick={() => setPage(page + 1)}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Modern Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: { borderRadius: 5, p: 1 }
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 3, pb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {dialogMode === "create" ? "Add New Product" : "Edit Product"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <ProductForm
            product={selectedProduct}
            mode={dialogMode}
            onSave={handleSaveProduct}
            onCancel={() => setDialogOpen(false)}
            loading={loading}
            categories={categories.filter(c => c !== "all")}
            brands={brands}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ProductManagement;