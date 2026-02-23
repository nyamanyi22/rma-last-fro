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
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import {
    Search,
    Add,
    Delete,
    Refresh,
    Download,
    Upload,
    FilterList,
    Receipt,
    People,
    Inventory,
    TrendingUp,
} from "@mui/icons-material";
import SalesTable from "../../components/admin/sales-management/SalesTable";
import SaleForm from "../../components/admin/sales-management/SaleForm";
import ImportSales from "../../components/admin/sales-management/ImportSales";
import SaleService from "../../services/api/saleService";

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
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        totalCustomers: 0,
        totalProducts: 0,
    });

    // Pagination
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

                // Compute simple stats
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

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            loadSales();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateSale = () => {
        setSelectedSale(null);
        setDialogMode("create");
        setDialogOpen(true);
    };

    const handleEditSale = (sale) => {
        setSelectedSale(sale);
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
        setLoading(true);
        try {
            if (dialogMode === "create") {
                await SaleService.createSale(saleData);
                showSuccess("Sale created successfully");
            } else {
                await SaleService.updateSale(selectedSale.id, saleData);
                showSuccess("Sale updated successfully");
            }
            setDialogOpen(false);
            loadSales();
        } catch (err) {
            showError(err.message || `Failed to ${dialogMode} sale`);
        } finally {
            setLoading(false);
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

    // Bulk select
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

    // CSV Export
    const handleExport = () => {
        const rows = [
            ["Order #", "Invoice #", "Customer", "Email", "Product", "SKU", "Qty", "Sale Date"],
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
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4">Sales Management</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Upload />}
                            onClick={() => setImportDialogOpen(true)}
                        >
                            Import CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleCreateSale}
                        >
                            Add Sale
                        </Button>
                    </Box>
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper sx={{ p: 2, textAlign: "center", bgcolor: "primary.light", color: "primary.contrastText" }}>
                            <Receipt sx={{ fontSize: 28, mb: 0.5 }} />
                            <Typography variant="h4">{stats.total}</Typography>
                            <Typography variant="body2">Total Sales</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.light", color: "success.contrastText" }}>
                            <TrendingUp sx={{ fontSize: 28, mb: 0.5 }} />
                            <Typography variant="h4">{stats.thisMonth}</Typography>
                            <Typography variant="body2">This Month</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper sx={{ p: 2, textAlign: "center", bgcolor: "warning.light", color: "warning.contrastText" }}>
                            <People sx={{ fontSize: 28, mb: 0.5 }} />
                            <Typography variant="h4">{stats.totalCustomers}</Typography>
                            <Typography variant="body2">Customers</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Paper sx={{ p: 2, textAlign: "center", bgcolor: "info.light", color: "info.contrastText" }}>
                            <Inventory sx={{ fontSize: 28, mb: 0.5 }} />
                            <Typography variant="h4">{stats.totalProducts}</Typography>
                            <Typography variant="body2">Products Sold</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Search & Actions */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                        placeholder="Search by order #, customer name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            <IconButton onClick={loadSales} disabled={loading}>
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

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {sales.length} of {totalCount} records
                    </Typography>
                </Box>
            </Paper>

            {/* Messages */}
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
                    {successMessage}
                </Alert>
            )}
            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage("")}>
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
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleBulkDelete}
                        size="small"
                    >
                        Delete Selected
                    </Button>
                </Paper>
            )}

            {/* Sales Table */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <SalesTable
                    sales={sales}
                    onEdit={handleEditSale}
                    onDelete={handleDeleteSale}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectRow={handleSelectRow}
                />
            )}

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Previous
                </Button>
                <Typography sx={{ mx: 2, alignSelf: "center" }}>
                    Page {page + 1} of {Math.max(1, Math.ceil(totalCount / rowsPerPage))}
                </Typography>
                <Button
                    disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </Button>
            </Box>

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {dialogMode === "create" ? "Add New Sale" : "Edit Sale"}
                </DialogTitle>
                <DialogContent>
                    <SaleForm
                        sale={selectedSale}
                        mode={dialogMode}
                        onSave={handleSaveSale}
                        onCancel={() => setDialogOpen(false)}
                        loading={loading}
                    />
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Import Sales from CSV</DialogTitle>
                <DialogContent>
                    <ImportSales
                        onImportComplete={() => {
                            setImportDialogOpen(false);
                            loadSales();
                            showSuccess("Sales imported successfully");
                        }}
                        onCancel={() => setImportDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default SalesManagement;
