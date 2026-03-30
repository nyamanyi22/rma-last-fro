import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    LinearProgress,
    Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
    Assignment,
    People,
    Inventory,
    BarChart,
    TrendingUp,
    AccessTime,
    CheckCircle,
    ErrorOutline,
    ArrowForward,
    Pending,
    RateReview,
} from "@mui/icons-material";
import rmaService from "../../services/api/rmaService";
import customerService from "../../services/api/customerService";
import productService from "../../services/api/productService";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    Legend as ChartLegend
} from 'recharts';

const ACCENT = '#6366f1';

const StatCard = ({ icon, label, value, color, gradient, loading, trend }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            background: gradient,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 20px 40px -12px ${color}55`,
            },
        }}
    >
        {/* Background decoration */}
        <Box
            sx={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
            }}
        />
        <Box
            sx={{
                position: 'absolute',
                right: 20,
                bottom: -30,
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
            }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box
                sx={{
                    p: 1.2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.18)',
                    display: 'flex',
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 22, color: '#fff' } })}
            </Box>
            {trend !== undefined && (
                <Chip
                    label={`${trend >= 0 ? '+' : ''}${trend}%`}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 10,
                        height: 22,
                    }}
                />
            )}
        </Box>

        {loading ? (
            <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 60, height: 44 }} />
        ) : (
            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, mb: 0.5 }}>
                {value}
            </Typography>
        )}
        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500 }}>
            {label}
        </Typography>
    </Paper>
);

const NavCard = ({ icon, label, description, path, color, gradient, badge }) => (
    <Paper
        component={RouterLink}
        to={path}
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            bgcolor: '#fff',
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
                borderColor: `${color}44`,
                '& .nav-arrow': { transform: 'translateX(4px)', opacity: 1 },
                '& .nav-icon-bg': { background: gradient },
            },
        }}
    >
        {/* Top color bar */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box
                className="nav-icon-bg"
                sx={{
                    p: 1.3,
                    borderRadius: 2,
                    background: `${color}18`,
                    display: 'flex',
                    transition: 'background 0.25s ease',
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 22, color } })}
            </Box>
            {badge !== null && badge !== undefined && (
                <Chip
                    label={badge}
                    size="small"
                    sx={{
                        bgcolor: `${color}18`,
                        color,
                        fontWeight: 700,
                        fontSize: 12,
                        height: 24,
                        borderRadius: 1.5,
                    }}
                />
            )}
        </Box>

        <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.3 }}>
                {label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                {description}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
                Open
            </Typography>
            <ArrowForward className="nav-arrow" sx={{ fontSize: 14, color, opacity: 0.6, transition: 'all 0.2s ease' }} />
        </Box>
    </Paper>
);

const AdminHome = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        pendingRMAs: 0,
        underReviewRMAs: 0,
        inRepairRMAs: 0,
        shippedRMAs: 0,
        approvedRMAs: 0,
        rejectedRMAs: 0,
        totalRMAs: 0,
        totalCustomers: 0,
        totalProducts: 0,
    });
    const [recentRmas, setRecentRmas] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const isAdmin = user && user.role !== 'csr';

                // Always fetch RMA stats, optionally fetch restricted stats
                const [rmaStatsRes, customersRes, productsRes] = await Promise.all([
                    rmaService.getDashboardStats(),
                    isAdmin ? customerService.getCustomers({ limit: 1 }) : Promise.resolve({ data: { total: 0 } }),
                    isAdmin ? productService.getProducts({ limit: 1 }) : Promise.resolve({ data: { total: 0 } }),
                ]);

                setStats({
                    pendingRMAs: rmaStatsRes.data?.pending || 0,
                    underReviewRMAs: rmaStatsRes.data?.under_review || 0,
                    inRepairRMAs: rmaStatsRes.data?.in_repair || 0,
                    shippedRMAs: rmaStatsRes.data?.shipped || 0,
                    approvedRMAs: rmaStatsRes.data?.approved || 0,
                    rejectedRMAs: rmaStatsRes.data?.rejected || 0,
                    totalRMAs: rmaStatsRes.data?.total || 0,
                    totalCustomers: customersRes.data?.total || 0,
                    totalProducts: productsRes.data?.total || 0,
                });

                // Fetch recent RMAs
                const recentRes = await rmaService.getRmas({ per_page: 5 });
                if (recentRes.success) {
                    setRecentRmas(recentRes.data);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const userName = user?.first_name || user?.name || 'Admin';
    const userRole = user?.role === 'csr' ? 'CSR Agent' : user?.role === 'admin' ? 'Administrator' : 'Staff';

    const kpiCards = [
        {
            icon: <Pending />,
            label: 'Pending RMAs',
            value: stats.pendingRMAs,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
        {
            icon: <RateReview />,
            label: 'In Progress',
            value: stats.underReviewRMAs + stats.inRepairRMAs + stats.shippedRMAs, // Composite total
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        },
        {
            icon: <CheckCircle />,
            label: 'Approved',
            value: stats.approvedRMAs,
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
            icon: <ErrorOutline />,
            label: 'Rejected',
            value: stats.rejectedRMAs,
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        },
    ];

    const navCards = [
        {
            icon: <Assignment />,
            label: 'RMA Management',
            description: 'Review, approve or reject return & warranty requests',
            path: '/admin/rma',
            color: ACCENT,
            gradient: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
            badge: stats.pendingRMAs || null,
        },
        ...(user?.role !== 'csr' ? [
            {
                icon: <People />,
                label: 'Customers',
                description: 'Manage customer accounts and view profiles',
                path: '/admin/customers',
                color: '#0ea5e9',
                gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                badge: stats.totalCustomers || null,
            },
            {
                icon: <Inventory />,
                label: 'Products',
                description: 'Maintain product catalog, pricing and inventory',
                path: '/admin/products',
                color: '#10b981',
                gradient: 'linear-gradient(135deg, #10b981, #059669)',
                badge: stats.totalProducts || null,
            },
            {
                icon: <BarChart />,
                label: 'Reports',
                description: 'Export analytics and performance reports',
                path: '/admin/reports',
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                badge: null,
            },
        ] : []),
    ];

    const totalRed = stats.totalRMAs || 1;
    const resolutionRate = Math.round(((stats.approvedRMAs + stats.rejectedRMAs) / totalRed) * 100);
    const pendingRate = Math.round((stats.pendingRMAs / totalRed) * 100);
    const reviewTotal = stats.underReviewRMAs + stats.inRepairRMAs + stats.shippedRMAs;
    const reviewRate = Math.round((reviewTotal / totalRed) * 100);

    return (
        <Box>
            {/* Hero header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #312e81 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                {/* decorative circles */}
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: `${ACCENT}18` }} />
                <Box sx={{ position: 'absolute', bottom: -40, right: 120, width: 140, height: 140, borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />

                <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                icon={<AccessTime sx={{ fontSize: '12px !important', color: '#a5f3fc !important' }} />}
                                label={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                size="small"
                                sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#a5f3fc', fontSize: 11, borderRadius: 1.5 }}
                            />
                            <Chip
                                label="System Online"
                                size="small"
                                sx={{ bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80', fontSize: 11, borderRadius: 1.5 }}
                            />
                        </Box>
                        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {userName} 👋
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {userRole} · Here's what's happening today
                        </Typography>
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/admin/rma"
                        variant="contained"
                        endIcon={<ArrowForward />}
                        sx={{
                            bgcolor: ACCENT,
                            '&:hover': { bgcolor: '#4f46e5' },
                            borderRadius: 2,
                            fontWeight: 600,
                            px: 3,
                            py: 1.2,
                            boxShadow: `0 4px 16px ${ACCENT}55`,
                        }}
                    >
                        View All RMAs
                    </Button>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {kpiCards.map((card) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
                        <StatCard {...card} loading={loading} />
                    </Grid>
                ))}
            </Grid>

            {/* Main content row */}
            <Grid container spacing={2.5}>
                {/* Recent Activity & Nav cards */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 }}>
                        Quick Access
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {navCards.map((card) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={card.label}>
                                <NavCard {...card} />
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 }}>
                        Recent Activity
                    </Typography>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box sx={{ minWidth: 600 }}>
                                {loading ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <CircularProgress size={30} />
                                    </Box>
                                ) : recentRmas.length > 0 ? (
                                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <Box component="thead" sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                            <Box component="tr">
                                                <Box component="th" sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600 }}>RMA #</Box>
                                                <Box component="th" sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600 }}>CUSTOMER</Box>
                                                <Box component="th" sx={{ px: 3, py: 2, textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600 }}>STATUS</Box>
                                                <Box component="th" sx={{ px: 3, py: 2, textAlign: 'right', fontSize: 11, color: '#64748b', fontWeight: 600 }}>ACTION</Box>
                                            </Box>
                                        </Box>
                                        <Box component="tbody">
                                            {recentRmas.map((rma) => (
                                                <Box component="tr" key={rma.id} sx={{ borderBottom: '1px solid #f1f5f9', '&:hover': { bgcolor: '#fbfcfd' } }}>
                                                    <Box component="td" sx={{ px: 3, py: 2.5 }}>
                                                        <Typography variant="subtitle2" sx={{ color: ACCENT, fontWeight: 700 }}>{rma.rmaNumber}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{rma.formattedDate}</Typography>
                                                    </Box>
                                                    <Box component="td" sx={{ px: 3, py: 2.5 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{rma.contactName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{rma.contactEmail}</Typography>
                                                    </Box>
                                                    <Box component="td" sx={{ px: 3, py: 2.5 }}>
                                                        <Chip 
                                                            label={rma.statusLabel} 
                                                            size="small" 
                                                            sx={{ 
                                                                bgcolor: `${rma.statusColor}15`, 
                                                                color: rma.statusColor, 
                                                                fontWeight: 700,
                                                                fontSize: 10,
                                                                borderRadius: 1.5,
                                                                height: 24
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Box component="td" sx={{ px: 3, py: 2.5, textAlign: 'right' }}>
                                                        <Button 
                                                            component={RouterLink} 
                                                            to={`/admin/rma?id=${rma.id}`} 
                                                            variant="text" 
                                                            size="small"
                                                            sx={{ color: '#64748b', textTransform: 'none', fontWeight: 600 }}
                                                        >
                                                            Manage
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Summary panel */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 }}>
                        RMA Overview
                    </Typography>
                    <Paper
                        elevation={0}
                        sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', bgcolor: '#fff' }}
                    >
                        {/* Total RMA banner */}
                        <Box
                            sx={{
                                px: 3,
                                py: 2.5,
                                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 10 }}>
                                    Total RMAs
                                </Typography>
                                {loading ? (
                                    <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 60, height: 40 }} />
                                ) : (
                                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1 }}>
                                        {stats.totalRMAs}
                                    </Typography>
                                )}
                            </Box>
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: `${ACCENT}33`,
                                    border: `1px solid ${ACCENT}44`,
                                }}
                            >
                                <TrendingUp sx={{ color: '#a5b4fc', fontSize: 24 }} />
                            </Box>
                        </Box>

                        {/* Breakdown */}
                        <Box sx={{ p: 3 }}>
                            {loading ? (
                                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={30} />
                                </Box>
                            ) : stats.totalRMAs > 0 ? (
                                <>
                                    <Box sx={{ height: 300, width: '100%', mb: 3 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Pending', value: stats.pendingRMAs, color: '#f59e0b' },
                                                        { name: 'Under Review', value: stats.underReviewRMAs, color: '#0ea5e9' },
                                                        { name: 'In Repair', value: stats.inRepairRMAs, color: '#8b5cf6' },
                                                        { name: 'Approved', value: stats.approvedRMAs, color: '#10b981' },
                                                        { name: 'Shipped', value: stats.shippedRMAs, color: '#6366f1' },
                                                        { name: 'Rejected', value: stats.rejectedRMAs, color: '#ef4444' },
                                                    ].filter(d => d.value > 0)}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={75}
                                                    outerRadius={105}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {[
                                                        { name: 'Pending', color: '#f59e0b' },
                                                        { name: 'Under Review', color: '#0ea5e9' },
                                                        { name: 'In Repair', color: '#8b5cf6' },
                                                        { name: 'Approved', color: '#10b981' },
                                                        { name: 'Shipped', color: '#6366f1' },
                                                        { name: 'Rejected', color: '#ef4444' },
                                                    ].map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 1, px: 1 }}>
                                        {[
                                            { label: 'Pending', value: stats.pendingRMAs, color: '#f59e0b' },
                                            { label: 'Processing', value: stats.underReviewRMAs + stats.inRepairRMAs + stats.shippedRMAs, color: '#3b82f6' },
                                            { label: 'Resolved', value: stats.approvedRMAs + stats.rejectedRMAs, color: '#10b981' },
                                        ].map((item) => (
                                            <Box key={item.label} sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', fontSize: 11 }}>
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: item.color, fontSize: 16 }}>
                                                    {item.value}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ py: 6, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">No RMA data available</Typography>
                                </Box>
                            )}

                            {user?.role !== 'csr' && (
                                <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                        Customers: <strong>{loading ? '—' : stats.totalCustomers}</strong>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                                        Products: <strong>{loading ? '—' : stats.totalProducts}</strong>
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminHome;