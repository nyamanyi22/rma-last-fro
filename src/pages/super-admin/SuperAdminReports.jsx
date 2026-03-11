import React from 'react';
import { Paper, Typography, Box, Grid, Button, Card, CardContent, Divider } from '@mui/material';
import {
    Description,
    Download,
    BarChart,
    PieChart,
    TrendingUp,
    PictureAsPdf
} from '@mui/icons-material';

const SuperAdminReports = () => {
    const reportCards = [
        {
            title: 'Inventory Report',
            desc: 'Complete overview of current stock levels and alerts.',
            icon: <BarChart sx={{ fontSize: 40, color: '#1976d2' }} />,
            bg: '#e3f2fd'
        },
        {
            title: 'Staff Performance',
            desc: 'Metrics on RMA processing times and closing rates.',
            icon: <TrendingUp sx={{ fontSize: 40, color: '#2e7d32' }} />,
            bg: '#e8f5e9'
        },
        {
            title: 'Financial Summary',
            desc: 'Total returns value and shipping cost analysis.',
            icon: <PieChart sx={{ fontSize: 40, color: '#ed6c02' }} />,
            bg: '#fff3e0'
        }
    ];

    return (
        <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    System Reports
                </Typography>
                <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                    Global Export
                </Button>
            </Box>

            <Grid container spacing={4}>
                {reportCards.map((report, index) => (
                    <Grid size={{ xs: 12, md: 4 }} key={index}>
                        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', border: '1px solid #edf2f7' }}>
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                <Box sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    backgroundColor: report.bg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    mb: 3
                                }}>
                                    {report.icon}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#334155' }}>
                                    {report.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                                    {report.desc}
                                </Typography>
                                <Divider sx={{ mb: 3, opacity: 0.5 }} />
                                <Box display="flex" gap={1} justifyContent="center">
                                    <Button variant="outlined" startIcon={<PictureAsPdf />} size="small" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                                        PDF
                                    </Button>
                                    <Button variant="outlined" startIcon={<Download />} size="small" sx={{ borderRadius: 1.5, textTransform: 'none' }}>
                                        CSV
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SuperAdminReports;
