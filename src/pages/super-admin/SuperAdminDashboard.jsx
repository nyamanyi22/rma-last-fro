import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton,
    CircularProgress,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    People,
    AdminPanelSettings,
    Assignment,
    CheckCircle,
    MoreVert,
    Refresh,
} from '@mui/icons-material';
import superAdminService from '../../services/api/superAdminService';

const StatCard = ({ title, value, change, icon, color, loading }) => (
    <Card
        sx={{
            height: '100%',
            borderRadius: 4,
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 25px 0 rgba(0,0,0,0.1)',
            },
        }}
    >
        <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: -20, right: -20,
                    width: 100, height: 100,
                    borderRadius: '50%',
                    opacity: 0.1,
                    background: color,
                }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, background: color, color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    {icon}
                </Box>
                <IconButton size="small">
                    <MoreVert />
                </IconButton>
            </Box>

            {loading ? (
                <Skeleton variant="text" width={80} height={50} />
            ) : (
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {value}
                </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
            </Typography>
            {change && (
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        bgcolor: 'grey.100',
                        px: 1, py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                    }}
                >
                    {change}
                </Typography>
            )}
        </CardContent>
    </Card>
);

const SuperAdminDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const fetchOverview = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await superAdminService.getOverview();
            if (res.success) {
                setOverview(res.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const stats = [
        {
            title: 'Total Customers',
            value: overview?.users?.total ?? '–',
            change: overview?.users?.new_this_month != null
                ? `+${overview.users.new_this_month} this month`
                : null,
            icon: <People sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        },
        {
            title: 'Active Staff',
            value: overview?.staff?.active ?? '–',
            change: overview?.staff?.total != null
                ? `${overview.staff.total} total`
                : null,
            icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #F5576C 0%, #F093FB 100%)',
        },
        {
            title: 'Pending RMAs',
            value: overview?.rmas?.pending ?? '–',
            change: overview?.rmas?.total != null
                ? `${overview.rmas.total} total`
                : null,
            icon: <Assignment sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
        },
        {
            title: 'Completed RMAs',
            value: overview?.rmas?.completed ?? '–',
            change: overview?.rmas?.in_progress != null
                ? `${overview.rmas.in_progress} in progress`
                : null,
            icon: <CheckCircle sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                    Dashboard Overview
                </Typography>
                <IconButton onClick={fetchOverview} disabled={loading} title="Refresh">
                    <Refresh />
                </IconButton>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stat Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <StatCard {...stat} loading={loading} />
                    </Grid>
                ))}
            </Grid>

            {/* Bottom row */}
            <Grid container spacing={3}>
                {/* Staff breakdown */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
                            Staff Overview
                        </Typography>
                        <Grid container spacing={2}>
                            {[
                                { label: 'Super Admins', value: overview?.staff?.by_role?.super_admin, color: '#ef4444' },
                                { label: 'Administrators', value: overview?.staff?.by_role?.admin, color: '#f59e0b' },
                                { label: 'CSR Agents', value: overview?.staff?.by_role?.csr, color: '#3b82f6' },
                                { label: 'Active Staff',  value: overview?.staff?.active, color: '#10b981' },
                            ].map((item, i) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={i}>
                                    <Box
                                        sx={{
                                            display: 'flex', alignItems: 'center', p: 2,
                                            borderRadius: 3, backgroundColor: '#f8fafc',
                                            '&:hover': { backgroundColor: '#f1f5f9' },
                                            transition: '0.2s',
                                        }}
                                    >
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, mr: 2, flexShrink: 0 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                {item.label}
                                            </Typography>
                                        </Box>
                                        {loading ? (
                                            <Skeleton variant="text" width={30} />
                                        ) : (
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: item.color }}>
                                                {item.value ?? '–'}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
                            <Typography variant="body2" color="text.secondary">
                                Products in catalogue: <strong>{loading ? '…' : (overview?.products?.total ?? '–')}</strong>
                                &nbsp;·&nbsp;
                                Active products: <strong>{loading ? '…' : (overview?.products?.active ?? '–')}</strong>
                                &nbsp;·&nbsp;
                                Sales this month: <strong>{loading ? '…' : (overview?.sales?.this_month ?? '–')}</strong>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* System status */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            System Status
                        </Typography>
                        {['Database', 'API', 'Storage', 'Email Service'].map((service) => (
                            <Box key={service} sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{service}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                                    <Typography variant="caption" color="success.main">Operational</Typography>
                                </Box>
                            </Box>
                        ))}

                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" color="text.secondary">
                                Last refreshed: {new Date().toLocaleTimeString()}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SuperAdminDashboard;
