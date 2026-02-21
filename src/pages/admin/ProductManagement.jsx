import React, { useState, useEffect } from "react";
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
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Refresh,
  Download,
  Upload,
  FilterList,
  Category,
  Inventory,
  LocalOffer,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import ProductTable from "../../components/admin/product-management/ProductTable";
import ProductForm from "../../components/admin/product-management/ProductForm";
import ProductService from "../../services/api/productService"; // 👈 Import product service

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  // Load products from backend
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
        setFilteredProducts(response.data.data);
        setTotalCount(response.data.total);

        // Calculate stats
        const allProducts = response.data.data;
        const total = allProducts.length;
        const active = allProducts.filter(p => p.isActive).length;
        const outOfStock = allProducts.filter(p => p.stockQuantity === 0).length;
        const categoriesCount = new Set(allProducts.map(p => p.category)).size;

        setStats({ total, active, outOfStock, categories: categoriesCount });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Load categories and brands
  // Load categories and brands
  const loadFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        ProductService.getCategories(),
        ProductService.getBrands(),
      ]);

      if (categoriesRes.success) {
        setCategories(["all", ...(categoriesRes.data || [])]);
      } else {
        // 👇 USER-FRIENDLY message
        setErrorMessage("Couldn't load categories. Showing all products.");
        setCategories(["all"]);
        setTimeout(() => setErrorMessage(""), 3000);

        // 👇 DEV details in console
        console.warn('Categories API returned unsuccessful:', categoriesRes);
      }

      if (brandsRes.success) {
        setBrands(brandsRes.data || []);
      } else {
        // 👇 DEV only warning (no user message)
        console.warn('Brands API returned unsuccessful:', brandsRes);
        setBrands([]);
      }

    } catch (err) {
      // 👇 DEV details in console
      console.error('🔧 FILTER LOAD ERROR:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });

      // 👇 SIMPLE user message
      setErrorMessage('Something went wrong. Please refresh.');
      setCategories(["all"]);
      setBrands([]);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
    loadFilters();
  }, [page, rowsPerPage]);

  // Debounced search
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
        loadProducts(); // Reload products
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
      loadProducts(); // Reload products
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
      loadProducts(); // Reload products
      loadFilters(); // Reload filters (in case new category/brand added)
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
      ...filteredProducts.map(p => [
        p.sku,
        p.name,
        p.category,
        p.brand,
        `$${p.price}`,
        `${p.warranty_months} months`,
        p.stock_quantity,
        p.is_active ? "Active" : "Inactive",
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
  };

  const handleRefresh = () => {
    loadProducts();
    loadFilters();
  };

  // Bulk Actions
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedIds, id];
    } else if (selectedIndex === 0) {
      newSelected = selectedIds.slice(1);
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = selectedIds.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selectedIds.slice(0, selectedIndex),
        ...selectedIds.slice(selectedIndex + 1),
      ];
    }

    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) {
      setLoading(true);
      try {
        await ProductService.bulkDeleteProducts(selectedIds);
        setSuccessMessage("Products deleted successfully");
        setSelectedIds([]);
        loadProducts(); // Reload products
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
      loadProducts(); // Reload products
    } catch (err) {
      setErrorMessage(err.message || `Failed to ${status ? "activate" : "deactivate"} products`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4">
            Product Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateProduct}
          >
            Add New Product
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "primary.light", color: "primary.contrastText" }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2">Total Products</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.light", color: "success.contrastText" }}>
              <Typography variant="h4">{stats.active}</Typography>
              <Typography variant="body2">Active Products</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "warning.light", color: "warning.contrastText" }}>
              <Typography variant="h4">{stats.outOfStock}</Typography>
              <Typography variant="body2">Out of Stock</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "info.light", color: "info.contrastText" }}>
              <Typography variant="h4">{stats.categories}</Typography>
              <Typography variant="body2">Categories</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Actions */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search by name, SKU, or brand..."
            value={searchQuery}
            onChange={handleSearch}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Refresh">
            <span>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Export CSV">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all") && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Results Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProducts.length} of {totalCount} products
          </Typography>
        </Box>
      </Paper>

      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#e3f2fd",
            border: "1px solid",
            borderColor: "primary.main",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
            {selectedIds.length} selected
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleBulkStatusUpdate(true)}
              size="small"
            >
              Activate
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Cancel />}
              onClick={() => handleBulkStatusUpdate(false)}
              size="small"
            >
              Deactivate
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={handleBulkDelete}
              size="small"
            >
              Delete
            </Button>
          </Box>
        </Paper>
      )}

      {/* Product Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onToggleStatus={handleToggleStatus}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
        />
      )}

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Typography sx={{ mx: 2, alignSelf: "center" }}>
          Page {page + 1} of {Math.ceil(totalCount / rowsPerPage)}
        </Typography>
        <Button
          disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </Box>

      {/* Product Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Add New Product" : "Edit Product"}
        </DialogTitle>
        <DialogContent>
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