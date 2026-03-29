import React, { useState, useEffect } from "react";
import {
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Fade,
  Paper,
  Snackbar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Search,
  Add,
  Delete,
  Refresh,
  Download,
  Upload,
  ReceiptOutlined,
  PeopleAltOutlined,
  Inventory2Outlined,
  TrendingUpOutlined,
  FilterList,
} from "@mui/icons-material";
import SalesTable from "../../components/admin/sales-management/SalesTable";
import SaleForm from "../../components/admin/sales-management/SaleForm";
import ImportSales from "../../components/admin/sales-management/ImportSales";
import SaleService from "../../services/api/saleService";

const GlassCard = ({ title, value, icon: Icon, color }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 4,
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      borderColor: alpha(color, 0.2),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}
  >
    <Box>
      <Typography variant="caption" sx={{ color: alpha(color, 0.8), fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color: color, fontWeight: 900, mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
    <Icon sx={{ fontSize: 48, color: alpha(color, 0.2) }} />
  </Box>
);

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [dialogMode, setDialogMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchQuery || undefined,
      };

      const response = await SaleService.getSales(params);

      if (response.success) {
        const fetchedSales = response.data?.data || [];
        setSales(fetchedSales);
        setTotalCount(response.data?.total || 0);

        const now = new Date();
        const thisMonth = fetchedSales.filter((s) => {
          const d = new Date(s.saleDate || s.sale_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const uniqueCustomers = new Set(fetchedSales.map((s) => s.customerEmail || s.customer_email)).size;
        const uniqueProducts = new Set(fetchedSales.map((s) => s.productId || s.product_id)).size;

        setStats({
          total: response.data?.total || fetchedSales.length,
          thisMonth,
          totalCustomers: uniqueCustomers,
          totalProducts: uniqueProducts,
        });
      } else {
        showError(response.message || "Failed to load sales");
      }
    } catch (err) {
      showError(err.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadSales();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateSale = () => {
    setSelectedSale(null);
    setFormErrors({});
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setFormErrors({});
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale record?")) return;
    setLoading(true);
    try {
      await SaleService.deleteSale(saleId);
      showSuccess("Sale deleted successfully");
      loadSales();
    } catch (err) {
      showError(err.message || "Failed to delete sale");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSale = async (saleData) => {
    setFormErrors({});
    try {
      if (selectedSale) {
        await SaleService.updateSale(selectedSale.id, saleData);
        showSuccess('Sale updated successfully');
      } else {
        await SaleService.createSale(saleData);
        showSuccess('Sale created successfully');
      }
      setDialogOpen(false);
      loadSales();
    } catch (error) {
      if (error.errors) {
        setFormErrors(error.errors);
      }
      showError(error.message || 'Failed to save sale');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected sale(s)?`)) return;
    setLoading(true);
    try {
      await SaleService.bulkDeleteSales(selectedIds);
      showSuccess("Sales deleted successfully");
      setSelectedIds([]);
      loadSales();
    } catch (err) {
      showError(err.message || "Failed to delete sales");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(sales.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const rows = [
      ["Invoice #", "Customer", "Email", "Product", "SKU", "Qty", "Sale Date"],
      ...sales.map((s) => [
        s.orderNumber || s.order_number,
        s.invoiceNumber || s.invoice_number || "",
        s.customerName || s.customer_name,
        s.customerEmail || s.customer_email,
        s.product?.name || "",
        s.product?.sku || "",
        s.quantity,
        s.saleDate || s.sale_date,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
              Sales Record
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Track transactional data and customer purchase history.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Upload />}
              onClick={() => setImportDialogOpen(true)}
              sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 3 }}
            >
              Batch Import
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleCreateSale}
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3)'
              }}
            >
              Log New Sale
            </Button>
          </Stack>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GlassCard title="Total Sales" value={stats.total} icon={ReceiptOutlined} color="#1976d2" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GlassCard title="Sales this month" value={stats.thisMonth} icon={TrendingUpOutlined} color="#2e7d32" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GlassCard title="Active Customers" value={stats.totalCustomers} icon={PeopleAltOutlined} color="#ed6c02" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <GlassCard title="Products Sold" value={stats.totalProducts} icon={Inventory2Outlined} color="#9c27b0" />
          </Grid>
        </Grid>

        {/* Search & Actions Bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            p: 2,
            bgcolor: alpha('#fff', 0.5),
            backdropFilter: 'blur(8px)',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            placeholder="Search by invoice #, customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': { borderColor: alpha('#1976d2', 0.2) },
                '&.Mui-focused fieldset': { borderColor: '#1976d2' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            <Tooltip title="Synchronize Data">
              <span>
                <IconButton onClick={loadSales} disabled={loading} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Download CSV Archive">
              <IconButton onClick={handleExport} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Download />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>



        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Fade in={selectedIds.length > 0}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 2,
                px: 3,
                borderRadius: 4,
                bgcolor: alpha('#d32f2f', 0.05),
                border: '1px solid',
                borderColor: alpha('#d32f2f', 0.2),
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'error.main' }}>
                {selectedIds.length} Sale Records Selected
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
              >
                Delete Selected
              </Button>
            </Stack>
          </Fade>
        )}

        {/* Table Area */}
        <Box sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha('#fff', 0.6),
              borderRadius: 4
            }}>
              <CircularProgress size={40} />
            </Box>
          )}
          <SalesTable
            sales={sales}
            onEdit={handleEditSale}
            onDelete={handleDeleteSale}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
          />
        </Box>

        {/* Pagination Area */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Displaying {sales.length} of {totalCount} transactions
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button size="small" disabled={page === 0} onClick={() => setPage(page - 1)} sx={{ borderRadius: 2 }}>
              Previous
            </Button>
            <Paper elevation={0} sx={{ px: 2, py: 0.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {page + 1} / {Math.max(1, Math.ceil(totalCount / rowsPerPage))}
              </Typography>
            </Paper>
            <Button size="small" disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1} onClick={() => setPage(page + 1)} sx={{ borderRadius: 2 }}>
              Next
            </Button>
          </Stack>
        </Stack>
      </Stack>

      {/* Editor Context */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {dialogMode === "create" ? "Record Transaction" : "Modify Sale Data"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 0 }}>
          <SaleForm
            sale={selectedSale}
            mode={dialogMode}
            onSave={handleSaveSale}
            onCancel={() => setDialogOpen(false)}
            loading={loading}
            errors={formErrors}
          />
        </DialogContent>
      </Dialog>

      {/* Import Context */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Import CSV Archive</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 0 }}>
          <ImportSales
            onImportComplete={() => {
              setImportDialogOpen(false);
              loadSales();
              showSuccess("Sales data synchronized successfully");
            }}
            onCancel={() => setImportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!successMessage || !!errorMessage}
        autoHideDuration={4000}
        onClose={(e, reason) => {
          if (reason === 'clickaway') return;
          setSuccessMessage("");
          setErrorMessage("");
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => { setSuccessMessage(""); setErrorMessage(""); }} 
          severity={successMessage ? "success" : "error"} 
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {successMessage || errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesManagement;
