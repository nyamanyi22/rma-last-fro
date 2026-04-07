import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, CircularProgress, Alert,
    Card, CardContent, Divider, List, ListItem, ListItemText, Button
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import rmaService from '../../services/api/rmaService';

const STATUS_COLORS = {
    pending: '#f59e0b',
    under_review: '#0ea5e9',
    approved: '#10b981',
    rejected: '#ef4444',
    in_repair: '#8b5cf6',
    ready_for_shipment: '#6366f1',
    shipped: '#6366f1',
    completed: '#10b981'
};
const ACCENT = '#6366f1';

const RMAReports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await rmaService.getDashboardOverview();
                if (response.success) {
                    // Map statuses for PieChart
                    const formattedStatusBreakdown = response.data.status_breakdown.map(item => ({
                        name: rmaService.getStatusLabel(item.status) || item.status,
                        value: item.count,
                        color: STATUS_COLORS[item.status] || '#8884d8'
                    }));

                    setData({
                        ...response.data,
                        status_breakdown: formattedStatusBreakdown
                    });
                } else {
                    setError('Failed to load dashboard overview data.');
                }
            } catch (err) {
                console.error('Error fetching dashboard overview:', err);
                setError(err.message || 'An error occurred while loading dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!data) return null;

    const { totals, status_breakdown, trend_line, avg_processing_time_days, top_reasons, top_products } = data;

    const handleExport = async () => {
        try {
            await rmaService.exportRmas();
        } catch (err) {
            console.error('Failed to export:', err);
            // Optional: show snackbar error
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, backgroundColor: '#f4f6f8', minHeight: '100vh', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>RMA Analytics Dashboard</Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                        color: 'white',
                    }}
                >
                    Export Report
                </Button>
            </Box>

            {/* Top Stat Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Today's RMAs</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }}>{totals.today}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#1a237e', boxShadow: '0 8px 32px 0 rgba(67, 233, 123, 0.3)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>This Week</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }}>{totals.week}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#880e4f', boxShadow: '0 8px 32px 0 rgba(250, 112, 154, 0.3)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>This Month</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1 }}>{totals.month}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', color: '#311b92', boxShadow: '0 8px 32px 0 rgba(166, 193, 238, 0.3)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Avg Processing</Typography>
                            <Box display="flex" alignItems="baseline" mt={1}>
                                <Typography variant="h2" sx={{ fontWeight: 800 }}>{avg_processing_time_days}</Typography>
                                <Typography variant="h6" sx={{ ml: 1, opacity: 0.8, fontWeight: 600 }}>days</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={4} mb={4}>
                {/* Trend Line Chart */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', height: '100%' }}>
                        <Typography variant="h6" mb={4} sx={{ fontWeight: 600, color: '#333' }}>RMA Volume Trend (Last 30 Days)</Typography>
                        <Box height={350}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend_line} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} tickFormatter={(tick) => {
                                        const d = new Date(tick);
                                        return `${d.getMonth() + 1}/${d.getDate()}`;
                                    }} />
                                    <YAxis allowDecimals={false} tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        labelStyle={{ color: '#888', fontWeight: 600, marginBottom: '8px' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={4} dot={{ r: 4, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} name="RMAs" animationDuration={1500} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Status Breakdown Pie Chart */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <Typography variant="h6" mb={2.5} sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Status Distribution
                        </Typography>
                        <Box sx={{ height: 260, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={status_breakdown}
                                        cx="50%"
                                        cy="48%"
                                        innerRadius={58}
                                        outerRadius={86}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1000}
                                    >
                                        {status_breakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Box
                            sx={{
                                mt: 1.5,
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: 1.25,
                            }}
                        >
                            {status_breakdown.map((item) => (
                                <Box
                                    key={item.name}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        minWidth: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#475569',
                                            fontWeight: 600,
                                            lineHeight: 1.3,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {item.name} ({item.value})
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Lists Section */}
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>Top Issue Reasons</Typography>
                        <List disablePadding>
                            {top_reasons.map((item, index) => (
                                <ListItem key={index} sx={{ py: 2, px: 2, mb: 1.5, borderRadius: 2, backgroundColor: '#f9fafc', '&:hover': { backgroundColor: '#f0f4f8' }, transition: 'background-color 0.2s' }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(25, 118, 210, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: '#1976d2', fontWeight: 700 }}>
                                        {index + 1}
                                    </Box>
                                    <ListItemText
                                        primary={item.reason}
                                        primaryTypographyProps={{ fontWeight: 600, color: '#444' }}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2' }}>{item.count}</Typography>
                                </ListItem>
                            ))}
                            {top_reasons.length === 0 && (
                                <ListItem><ListItemText primary="No data available" /></ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 3 }}>Most Returned Products</Typography>
                        <List disablePadding>
                            {top_products.map((item, index) => (
                                <ListItem key={item.product_id} sx={{ py: 2, px: 2, mb: 1.5, borderRadius: 2, backgroundColor: '#fff5f8', '&:hover': { backgroundColor: '#ffeef4' }, transition: 'background-color 0.2s' }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(233, 30, 99, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2, color: '#e91e63', fontWeight: 700 }}>
                                        {index + 1}
                                    </Box>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`ID: ${item.product_id}`}
                                        primaryTypographyProps={{ fontWeight: 600, color: '#444' }}
                                        secondaryTypographyProps={{ fontSize: '0.8rem', mt: 0.5 }}
                                    />
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#e91e63' }}>{item.count}</Typography>
                                </ListItem>
                            ))}
                            {top_products.length === 0 && (
                                <ListItem><ListItemText primary="No data available" /></ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RMAReports;
