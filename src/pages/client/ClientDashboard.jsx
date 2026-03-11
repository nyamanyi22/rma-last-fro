import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    AccessTime,
    Error,
    ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import rmaService from '../../services/api/rmaService';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });
    const [recentRmas, setRecentRmas] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Run both requests in parallel:
            // - allResponse: fetch all RMAs (up to 100) for accurate stat counts
            // - recentResponse: fetch only 3 most recent for the "Recent Requests" list
            const [allResponse, recentResponse] = await Promise.all([
                rmaService.getMyRmas({ per_page: 100 }),
                rmaService.getMyRmas({ per_page: 3 }),
            ]);

            if (recentResponse.success) {
                setRecentRmas(recentResponse.data.data || []);
            }

            if (allResponse.success) {
                const allRmas = allResponse.data.data || [];
                const total = allResponse.data.total || allRmas.length;

                // Calculate accurate stats from the full list
                const pending = allRmas.filter(r => r.status === 'pending' || r.status === 'under_review').length;
                const approved = allRmas.filter(r => ['approved', 'completed', 'repaired', 'delivered', 'shipped', 'ready_for_shipment'].includes(r.status)).length;
                const rejected = allRmas.filter(r => r.status === 'rejected' || r.status === 'cancelled').length;

                setStats({ pending, approved, rejected, total });
            } else if (!recentResponse.success) {
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'pending': 'warning',
            'under_review': 'info',
            'approved': 'success',
            'rejected': 'error',
            'in_repair': 'info',
            'repaired': 'success',
            'shipped': 'primary',
            'delivered': 'success',
            'completed': 'success',
            'cancelled': 'default'
        };
        return statusMap[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'pending': 'Pending',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'in_repair': 'In Repair',
            'repaired': 'Repaired',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Stats cards configuration
    const statCards = [
        {
            title: 'Pending Reviews',
            value: stats.pending,
            icon: <AccessTime sx={{ fontSize: 30 }} />,
            color: 'warning.main',
            bgcolor: 'warning.light'
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: <CheckCircle sx={{ fontSize: 30 }} />,
            color: 'success.main',
            bgcolor: 'success.light'
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: <Error sx={{ fontSize: 30 }} />,
            color: 'error.main',
            bgcolor: 'error.light'
        },
        {
            title: 'Total Requests',
            value: stats.total,
            icon: <Assignment sx={{ fontSize: 30 }} />,
            color: 'info.main',
            bgcolor: 'info.light'
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track and manage your return requests
                </Typography>
            </Box>

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

            {/* Stats Cards */}
            {!loading && !error && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {statCards.map((stat, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Card sx={{ borderRadius: 4, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: stat.bgcolor, color: stat.color }}>
                                            {stat.icon}
                                        </Box>
                                    </Box>
                                    <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Grid container spacing={3}>
                {/* Recent Requests */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={600}>Recent Requests</Typography>
                            <Button
                                endIcon={<ArrowForward />}
                                onClick={() => navigate('/client/rma/history')}
                                disabled={recentRmas.length === 0}
                            >
                                View All
                            </Button>
                        </Box>

                        {recentRmas.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No recent RMA requests found.
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {recentRmas.map((rma) => (
                                    <Box
                                        key={rma.id}
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            borderRadius: 3,
                                            bgcolor: 'grey.50',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'grey.100'
                                            },
                                            '&:last-child': { mb: 0 }
                                        }}
                                        onClick={() => navigate(`/client/rma/${rma.id}`)}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {rma.productName || rma.product?.name || 'Unknown Product'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {rma.rmaNumber} • {formatDate(rma.createdAt || rma.submittedDate)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={getStatusLabel(rma.status)}
                                            color={getStatusColor(rma.status)}
                                            size="small"
                                            sx={{ fontWeight: 600, borderRadius: 2 }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Start New Request Card */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            color: 'white',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}
                    >
                        <Assignment sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Need to return an item?
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                            Start a new RMA request in just a few clicks.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            size="large"
                            onClick={() => navigate('/client/rma/new')}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                bgcolor: 'white',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'grey.100' }
                            }}
                        >
                            Start Request
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClientDashboard;