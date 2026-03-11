import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    IconButton
} from '@mui/material';
import {
    People,
    AdminPanelSettings,
    Assignment,
    CheckCircle,
    MoreVert
} from '@mui/icons-material';

const SuperAdminDashboard = () => {
    const stats = [
        {
            title: 'Total Users',
            value: '1,250',
            change: '+15%',
            icon: <People sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)'
        },
        {
            title: 'Active Staff',
            value: '24',
            change: '+2',
            icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #F5576C 0%, #F093FB 100%)'
        },
        {
            title: 'Pending RMAs',
            value: '45',
            change: '+12%',
            icon: <Assignment sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)'
        },
        {
            title: 'System Health',
            value: '98%',
            change: 'Stable',
            icon: <CheckCircle sx={{ fontSize: 40 }} />,
            color: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)'
        },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard Overview
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 4,
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 4px 25px 0 rgba(0,0,0,0.1)',
                                }
                            }}
                        >
                            <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -20,
                                        right: -20,
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        opacity: 0.1,
                                        background: stat.color
                                    }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 3,
                                            background: stat.color,
                                            color: 'white',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <IconButton size="small">
                                        <MoreVert />
                                    </IconButton>
                                </Box>

                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {stat.title}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: stat.change.includes('+') ? 'success.main' : 'text.secondary',
                                        bgcolor: stat.change.includes('+') ? 'success.lighter' : 'grey.100',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontWeight: 600
                                    }}
                                >
                                    {stat.change} since last month
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, height: '100%', border: '1px solid #edf2f7', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h6" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
                            Recent Activity
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[
                                { user: 'Admin Sarah', action: 'Approved RMA #2024-0012', time: '2 mins ago', icon: <CheckCircle sx={{ color: '#10b981' }} /> },
                                { user: 'Staff Mike', action: 'Added comment to RMA #2024-0015', time: '15 mins ago', icon: <Assignment sx={{ color: '#3b82f6' }} /> },
                                { user: 'System', action: 'Generated weekly backup', time: '1 hour ago', icon: <AdminPanelSettings sx={{ color: '#6366f1' }} /> },
                                { user: 'Customer John', action: 'Submitted new RMA #2024-0018', time: '3 hours ago', icon: <Assignment sx={{ color: '#f59e0b' }} /> },
                            ].map((item, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: 3, backgroundColor: '#f8fafc', '&:hover': { backgroundColor: '#f1f5f9' }, transition: '0.2s' }}>
                                    <Box sx={{ p: 1, borderRadius: 2, backgroundColor: 'white', mr: 2, display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        {item.icon}
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>{item.user}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.action}</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>{item.time}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
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
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SuperAdminDashboard;
