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
    Paper,
    Stack,
    Fade,
    Snackbar,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Search,
    PersonAdd,
    Refresh,
    FileDownloadOutlined,
    FileUploadOutlined,
    PeopleAltOutlined,
    HowToRegOutlined,
    PersonAddOutlined,
    DeleteOutline,
    CheckCircleOutline,
    BlockOutlined,
} from "@mui/icons-material";
import CustomerTable from "../../components/admin/customer-management/CustomerTable";
import CustomerForm from "../../components/admin/customer-management/CustomerForm";
import CustomerDetails from "../../components/admin/customer-management/CustomerDetails";
import ImportCustomers from "../../components/admin/customer-management/ImportCustomers";
import CustomerService from "../../services/api/customerService";

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

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [dialogMode, setDialogMode] = useState("create");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        newThisMonth: 0,
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [exporting, setExporting] = useState(false);

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(""), 5000);
    };

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page: page + 1,
                per_page: rowsPerPage,
                search: searchQuery || undefined,
            };

            const response = await CustomerService.getCustomers(params);

            if (response.success) {
                const fetchedCustomers = response.data?.data || [];
                setCustomers(fetchedCustomers);
                setTotalCount(response.data?.total || 0);

                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

                const active = fetchedCustomers.filter(c => c.is_active).length;
                const newThisMonth = fetchedCustomers.filter(c =>
                    new Date(c.created_at) >= firstDayOfMonth
                ).length;

                setStats({
                    total: response.data?.total || fetchedCustomers.length,
                    active,
                    newThisMonth,
                });
            } else {
                showError(response.message || "Failed to load customers");
            }
        } catch (err) {
            showError(err.message || "Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, [page]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            loadCustomers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCreateCustomer = () => {
        setSelectedCustomer(null);
        setFormErrors({});
        setDialogMode("create");
        setDialogOpen(true);
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setFormErrors({});
        setDialogMode("edit");
        setDialogOpen(true);
    };

    const handleDeleteCustomer = async (customerId) => {
        if (!window.confirm("Are you sure you want to delete this customer?")) return;
        setLoading(true);
        try {
            await CustomerService.deleteCustomer(customerId);
            showSuccess("Customer deleted successfully");
            loadCustomers();
        } catch (err) {
            showError(err.message || "Failed to delete customer");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return;

        setLoading(true);
        try {
            await CustomerService.updateCustomer(customerId, {
                ...customer,
                isActive: !customer.is_active,
            });
            showSuccess(`Customer ${!customer.is_active ? 'activated' : 'deactivated'} successfully`);
            loadCustomers();
        } catch (err) {
            showError(err.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomer = async (customerData) => {
        setFormErrors({});
        try {
            if (selectedCustomer) {
                await CustomerService.updateCustomer(selectedCustomer.id, customerData);
                showSuccess('Customer updated successfully');
            } else {
                await CustomerService.createCustomer(customerData);
                showSuccess('Customer created successfully');
            }
            setDialogOpen(false);
            loadCustomers();
        } catch (error) {
            if (error.errors) {
                setFormErrors(error.errors);
            }
            showError(error.message || 'Failed to save customer');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} selected customers?`)) return;
        setLoading(true);
        try {
            await CustomerService.bulkDeleteCustomers(selectedIds);
            showSuccess("Customers deleted successfully");
            setSelectedIds([]);
            loadCustomers();
        } catch (err) {
            showError(err.message || "Failed to delete customers");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        setLoading(true);
        try {
            await CustomerService.bulkUpdateStatus(selectedIds, status);
            showSuccess(`Customers ${status ? 'activated' : 'deactivated'} successfully`);
            setSelectedIds([]);
            loadCustomers();
        } catch (err) {
            showError(err.message || `Failed to ${status ? 'activate' : 'deactivate'} customers`);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedIds(customers.map((c) => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params = {};
            if (selectedIds.length > 0) {
                params.ids = selectedIds;
            } else if (searchQuery) {
                params.search = searchQuery;
            }

            await CustomerService.exportCustomers(params);
            showSuccess("Member ledger export finalized");
        } catch (err) {
            showError(err.message || "Export synchronization failure");
        } finally {
            setExporting(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={4}>
                {/* Header Section */}
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
                            Customer Base
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage your customer relationships and account access.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<FileUploadOutlined />}
                            onClick={() => setImportDialogOpen(true)}
                            sx={{ borderRadius: 3, px: 3, fontWeight: 700, textTransform: 'none' }}
                        >
                            Batch Import
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PersonAdd />}
                            onClick={handleCreateCustomer}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3)'
                            }}
                        >
                            Add New Customer
                        </Button>
                    </Stack>
                </Stack>

                {/* Stats Grid */}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GlassCard title="Total Customers" value={stats.total} icon={PeopleAltOutlined} color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <GlassCard title="Active Accounts" value={stats.active} icon={HowToRegOutlined} color="#2e7d32" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                        <GlassCard title="Fresh Signups" value={stats.newThisMonth} icon={PersonAddOutlined} color="#ed6c02" />
                    </Grid>
                </Grid>

                {/* Action Bar */}
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
                        placeholder="Search by name, email or phone..."
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
                        <Tooltip title="Refresh Catalog">
                            <span>
                                <IconButton onClick={loadCustomers} disabled={loading} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                    <Refresh />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={exporting ? "Exporting..." : "Export Customer List"}>
                            <span>
                                <IconButton
                                    onClick={handleExport}
                                    disabled={exporting}
                                    sx={{
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        position: 'relative'
                                    }}
                                >
                                    {exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadOutlined />}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>



                {/* Bulk Selection Bar */}
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
                                bgcolor: alpha('#1976d2', 0.05),
                                border: '1px solid',
                                borderColor: alpha('#1976d2', 0.2),
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                {selectedIds.length} Customers Selected
                            </Typography>
                            <Stack direction="row" spacing={2}>
                                <Button variant="text" color="success" startIcon={<CheckCircleOutline />} onClick={() => handleBulkStatusUpdate(true)}>
                                    Activate
                                </Button>
                                <Button variant="text" color="warning" startIcon={<BlockOutlined />} onClick={() => handleBulkStatusUpdate(false)}>
                                    Deactivate
                                </Button>
                                <Button variant="contained" color="error" startIcon={<DeleteOutline />} onClick={handleBulkDelete} sx={{ borderRadius: 2 }}>
                                    Remove
                                </Button>
                            </Stack>
                        </Stack>
                    </Fade>
                )}

                {/* Main Content Area */}
                <Box sx={{ position: 'relative' }}>
                    {loading && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#fff', 0.6), borderRadius: 4 }}>
                            <CircularProgress size={40} />
                        </Box>
                    )}
                    <CustomerTable
                        customers={customers}
                        onEdit={handleEditCustomer}
                        onDelete={handleDeleteCustomer}
                        onToggleStatus={handleToggleStatus}
                        selectedIds={selectedIds}
                        onSelectAll={handleSelectAll}
                        onSelectRow={handleSelectRow}
                    />
                </Box>

                {/* Footer Navigation */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Showing {customers.length} of {totalCount} records
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
                        {dialogMode === "create" ? "Add New Customer Account" : "Modify Member Profile"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4, pt: 0 }}>
                    <CustomerForm
                        customer={selectedCustomer}
                        mode={dialogMode}
                        onSave={handleSaveCustomer}
                        onCancel={() => setDialogOpen(false)}
                        loading={loading}
                        errors={formErrors}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={importDialogOpen}
                onClose={() => setImportDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
            >
                <DialogTitle sx={{ p: 4, pb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Import Customer Archive</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4, pt: 0 }}>
                    <ImportCustomers
                        onImportComplete={() => {
                            setImportDialogOpen(false);
                            loadCustomers();
                            showSuccess("Member database synchronized successfully");
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

export default CustomerManagement;