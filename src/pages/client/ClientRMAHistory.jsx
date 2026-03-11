import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import { Visibility, Search, FilterList } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import rmaService from '../../services/api/rmaService';

const ClientRMAHistory = () => {
    const navigate = useNavigate();
    const [rmas, setRmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch RMA history from backend
    const loadRmas = async () => {
        setLoading(true);
        try {
            const params = {
                page: page,
                search: searchQuery || undefined
            };

            const response = await rmaService.getMyRmas(params);

            if (response.success) {
                setRmas(response.data.data || []);
                setTotalPages(response.data.last_page || 1);
                setTotalItems(response.data.total || 0);
            } else {
                setError('Failed to load RMA history');
            }
        } catch (err) {
            console.error('Error loading RMAs:', err);
            setError(err.message || 'Failed to load RMA history');
        } finally {
            setLoading(false);
        }
    };

    // Load RMAs on mount and when page/search changes
    useEffect(() => {
        loadRmas();
    }, [page]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            loadRmas();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleViewDetails = (rmaId) => {
        navigate(`/client/rma/${rmaId}`);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const getStatusChip = (status) => {
        const statusMap = {
            'pending': { color: 'warning', label: 'Pending' },
            'under_review': { color: 'info', label: 'Under Review' },
            'approved': { color: 'success', label: 'Approved' },
            'rejected': { color: 'error', label: 'Rejected' },
            'in_repair': { color: 'secondary', label: 'In Repair' },
            'repaired': { color: 'success', label: 'Repaired' },
            'shipped': { color: 'primary', label: 'Shipped' },
            'delivered': { color: 'success', label: 'Delivered' },
            'completed': { color: 'success', label: 'Completed' },
            'cancelled': { color: 'default', label: 'Cancelled' },
        };

        const config = statusMap[status] || { color: 'default', label: status };

        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                sx={{ borderRadius: 1, fontWeight: 600 }}
            />
        );
    };

    const getTypeChip = (type) => {
        const typeMap = {
            'return': { color: 'primary', label: 'Return' },
            'warranty': { color: 'secondary', label: 'Warranty' },
            'repair': { color: 'info', label: 'Repair' },
        };

        const config = typeMap[type] || { color: 'default', label: type };

        return (
            <Chip
                label={config.label}
                color={config.color}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 1 }}
            />
        );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                My RMA History
            </Typography>

            {/* Search Bar */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Search by RMA ID or Product"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    fullWidth
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                    }}
                    sx={{ maxWidth: 400 }}
                />
                <IconButton>
                    <FilterList />
                </IconButton>
                {totalItems > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        {totalItems} {totalItems === 1 ? 'request' : 'requests'} found
                    </Typography>
                )}
            </Paper>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && rmas.length === 0 && (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No RMA requests found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You haven't submitted any RMA requests yet.
                    </Typography>
                </Paper>
            )}

            {/* RMA Table */}
            {!loading && !error && rmas.length > 0 && (
                <>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>RMA Number</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date Submitted</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rmas.map((rma) => (
                                    <TableRow key={rma.id} hover>
                                        <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                                            {rma.rmaNumber}
                                        </TableCell>
                                        <TableCell>{rma.productName || 'Unknown'}</TableCell>
                                        <TableCell>{getTypeChip(rma.rmaType)}</TableCell>
                                        <TableCell>{rma.formattedDate}</TableCell>
                                        <TableCell>{getStatusChip(rma.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleViewDetails(rma.id)}
                                            >
                                                <Visibility />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default ClientRMAHistory;