import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Chip
} from '@mui/material';
import {
    Assignment,
    CheckCircle,
    AccessTime,
    Error,
    ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const navigate = useNavigate();

    // Mock data
    const stats = [
        {
            title: 'Pending Reviews',
            value: '2',
            icon: <AccessTime sx={{ fontSize: 30 }} />,
            color: 'warning.main',
            bgcolor: 'warning.light'
        },
        {
            title: 'Approved',
            value: '5',
            icon: <CheckCircle sx={{ fontSize: 30 }} />,
            color: 'success.main',
            bgcolor: 'success.light'
        },
        {
            title: 'Rejected',
            value: '1',
            icon: <Error sx={{ fontSize: 30 }} />,
            color: 'error.main',
            bgcolor: 'error.light'
        },
        {
            title: 'Total Requests',
            value: '8',
            icon: <Assignment sx={{ fontSize: 30 }} />,
            color: 'info.main',
            bgcolor: 'info.light'
        },
    ];

    const recentActivity = [
        { id: 'RMA-2024-001', product: 'Dell XPS 13', status: 'Pending', date: '2024-02-10' },
        { id: 'RMA-2024-002', product: 'Logitech Mouse', status: 'Approved', date: '2024-02-08' },
        { id: 'RMA-2024-003', product: 'Samsung Monitor', status: 'In Repair', date: '2024-02-01' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'In Repair': return 'info';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

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

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
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

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={600}>Recent Requests</Typography>
                            <Button endIcon={<ArrowForward />} onClick={() => navigate('/client/rma/history')}>
                                View All
                            </Button>
                        </Box>

                        <Box>
                            {recentActivity.map((rma, index) => (
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
                                        '&:last-child': { mb: 0 }
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>{rma.product}</Typography>
                                        <Typography variant="caption" color="text.secondary">ID: {rma.id} • {rma.date}</Typography>
                                    </Box>
                                    <Chip
                                        label={rma.status}
                                        color={getStatusColor(rma.status)}
                                        size="small"
                                        sx={{ fontWeight: 600, borderRadius: 2 }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
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
                            sx={{ borderRadius: 3, px: 4, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
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
