import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Paper,
    Typography,
    Box,
    Grid,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Button,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    Search,
    FilterList,
    Refresh,
    Download,
    Assignment,
    Pending,
    RateReview,
    CheckCircle,
    Cancel,
} from "@mui/icons-material";
import RMAFilters from "../../components/admin/rma-management/RMAFilters";
import RMAList from "../../components/admin/rma-management/RMAList";
import RMADetailsModal from "../../components/admin/rma-management/RMADetailsModal";
import rmaService from "../../services/api/rmaService";

const ACCENT = '#6366f1';

const StatBadge = ({ icon, label, value, color, gradient }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: 3,
            background: gradient,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' },
        }}
    >
        <Box sx={{ position: 'absolute', right: -12, top: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', display: 'flex' }}>
                {React.cloneElement(icon, { sx: { fontSize: 18, color: '#fff' } })}
            </Box>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: 11 }}>{label}</Typography>
            </Box>
        </Box>
    </Paper>
);

const RMAManagement = () => {
    const [activeTab, setActiveTab] = useState(4);
    const [rmaList, setRmaList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ status: "all", rmaType: "all", priority: "all", dateRange: "all" });
    const [selectedRma, setSelectedRma] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ pending: 0, under_review: 0, in_repair: 0, shipped: 0, approved: 0, rejected: 0, total: 0 });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const [searchParams, setSearchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchStats = async () => {
        try {
            const response = await rmaService.getDashboardStats();
            if (response.success) setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchRmas = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                search: searchQuery,
                status: filters.status === "all" ? undefined : filters.status,
                rma_type: filters.rmaType === "all" ? undefined : filters.rmaType,
                priority: filters.priority === "all" ? undefined : filters.priority,
            };
            const response = await rmaService.getRmas(params);
            if (response.success) {
                setRmaList(response.data); // data is already the mapped array
                if (response.pagination) {
                    setPagination({
                        current_page: response.pagination.current_page,
                        last_page: response.pagination.last_page,
                        total: response.pagination.total,
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching RMAs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchRmas(1);
        
        // Auto-open detail if id is in search params
        const rmaId = searchParams.get('id');
        if (rmaId) {
            handleViewDetails({ id: rmaId });
            // Clear param after opening so it doesn't reopen if we navigate away/back
            setSearchParams({}, { replace: true });
        }
    }, [filters, searchQuery]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        const statusMap = ["pending", "under_review", "approved", "rejected", "all"];
        setFilters(prev => ({ ...prev, status: statusMap[newValue] }));
    };

    const handleViewDetails = async (rma) => {
        setLoading(true);
        try {
            const response = await rmaService.getRmaAdmin(rma.id);
            if (response.success) { setSelectedRma(response.data); setDetailsModalOpen(true); }
        } catch (error) {
            console.error("Error fetching RMA details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewRma = async (rma) => {
        setLoading(true);
        try {
            const response = await rmaService.getRmaAdmin(rma.id);
            if (response.success) { setSelectedRma(response.data); setDetailsModalOpen(true); }
        } catch (error) {
            console.error("Error fetching RMA details:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshRma = async (id) => {
        try {
            const response = await rmaService.getRmaAdmin(id);
            if (response.success) setSelectedRma(response.data);
        } catch (error) {
            console.error("Error refreshing RMA:", error);
        }
    };

    const handleUpdateStatus = async (rmaId, newStatus, notesOrData = "", rejectionReason = null) => {
        setLoading(true);
        try {
            let payload = { status: newStatus };

            if (typeof notesOrData === 'object' && notesOrData !== null) {
                // If an object is passed, spread it into the payload
                payload = { ...payload, ...notesOrData };
            } else {
                // Fallback for string-based calls
                payload.admin_notes = notesOrData;
                if (rejectionReason) payload.rejection_reason = rejectionReason;
            }

            const response = await rmaService.updateRma(rmaId, payload);
            if (response.success) {
                fetchStats();
                fetchRmas(pagination.current_page);
                refreshRma(rmaId); // Refresh the modal data too
                setToast({
                    open: true,
                    message: `RMA ${response.data.rmaNumber || rmaId} updated to ${newStatus.replace('_', ' ')}`,
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error("Error updating RMA:", error);
            setToast({
                open: true,
                message: error.message || 'Error updating RMA',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

    const handleExport = () => {
        const csvContent = [
            ["RMA Number", "Customer", "Product", "Type", "Status", "Submitted Date"],
            ...rmaList.map(rma => [rma.rmaNumber, rma.customerName, rma.productName, rma.type, rma.status, rma.formattedDate]),
        ].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rma_export_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    const statBadges = [
        { icon: <Pending />, label: 'Pending', value: stats.pending, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { icon: <RateReview />, label: 'In Progress', value: stats.under_review + stats.in_repair + stats.shipped, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
        { icon: <CheckCircle />, label: 'Approved', value: stats.approved, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
        { icon: <Cancel />, label: 'Rejected', value: stats.rejected, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    ];

    return (
        <Box>
            {/* Page header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.3 }}>
                        RMA Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Logged in as: <strong>{user.name}</strong> · {user.role === 'csr' ? 'CSR Agent' : 'Administrator'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <Tooltip title="Refresh data">
                        <span>
                            <IconButton
                                onClick={() => { fetchStats(); fetchRmas(pagination.current_page); }}
                                disabled={loading}
                                sx={{ bgcolor: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 2, '&:hover': { bgcolor: `${ACCENT}0d`, borderColor: `${ACCENT}44` } }}
                            >
                                <Refresh sx={{ color: loading ? '#ccc' : ACCENT }} />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExport}
                        sx={{ borderRadius: 2, fontWeight: 600, borderColor: 'rgba(0,0,0,0.1)', color: '#374151', '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: `${ACCENT}08` } }}
                    >
                        Export CSV
                    </Button>
                </Box>
            </Box>

            {/* Stat badges */}
                {statBadges.map((badge) => (
                    <Grid size={{ xs: 6, md: 3 }} key={badge.label}>
                        <StatBadge {...badge} />
                    </Grid>
                ))}

            {/* Search + Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: '1px solid rgba(0,0,0,0.06)',
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by RMA #, customer or product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{
                            flex: 1,
                            minWidth: 200,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2.5,
                                bgcolor: '#f8fafc',
                                '&:hover fieldset': { borderColor: ACCENT },
                                '&.Mui-focused fieldset': { borderColor: ACCENT },
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: '#94a3b8', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                        {filters.status !== "all" && (
                            <Chip
                                label={`Status: ${filters.status.replace('_', ' ')}`}
                                onDelete={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                                size="small"
                                sx={{
                                    bgcolor: `${ACCENT}12`,
                                    color: ACCENT,
                                    fontWeight: 600,
                                    border: `1px solid ${ACCENT}33`,
                                }}
                            />
                        )}
                        <Typography variant="caption" sx={{ color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {pagination.total} total
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Main content */}
            <Grid container spacing={2.5}>
                {/* Sidebar filters */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <RMAFilters
                        filters={filters}
                        onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                        onClearFilters={() => setFilters({ status: 'all', rmaType: 'all', priority: 'all', dateRange: 'all' })}
                    />
                </Grid>

                {/* Table */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Paper
                        elevation={0}
                        sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', bgcolor: '#fff' }}
                    >
                        {/* Tabs */}
                        <Box
                            sx={{
                                px: 2,
                                bgcolor: '#f8fafc',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                            }}
                        >
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        minHeight: 48,
                                        color: '#64748b',
                                        '&.Mui-selected': { color: ACCENT },
                                    },
                                    '& .MuiTabs-indicator': { bgcolor: ACCENT, height: 3, borderRadius: '3px 3px 0 0' },
                                }}
                            >
                                <Tab label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        Pending
                                        {stats.pending > 0 && (
                                            <Chip label={stats.pending} size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#fef3c7', color: '#92400e', '& .MuiChip-label': { px: 0.8 } }} />
                                        )}
                                    </Box>
                                } />
                                <Tab label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                        In Progress
                                        {(stats.under_review + stats.in_repair + stats.shipped) > 0 && (
                                            <Chip label={stats.under_review + stats.in_repair + stats.shipped} size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#dbeafe', color: '#1e40af', '& .MuiChip-label': { px: 0.8 } }} />
                                        )}
                                    </Box>
                                } />
                                <Tab label="Approved" />
                                <Tab label="Rejected" />
                                <Tab label="All RMAs" />
                            </Tabs>
                        </Box>

                        {/* RMA List */}
                        {loading ? (
                            <Box sx={{ display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: 'center', p: 8, gap: 2 }}>
                                <CircularProgress size={40} sx={{ color: ACCENT }} />
                                <Typography variant="body2" sx={{ color: '#94a3b8' }}>Loading RMAs...</Typography>
                            </Box>
                        ) : (
                            <RMAList
                                rmas={rmaList}
                                onViewDetails={handleViewDetails}
                                onReview={handleReviewRma}
                                userRole={user.role}
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Modals */}
            {selectedRma && (
                <RMADetailsModal
                    open={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    rma={selectedRma}
                    onUpdateStatus={handleUpdateStatus}
                    onRefresh={() => refreshRma(selectedRma.id)}
                />
            )}

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RMAManagement;
