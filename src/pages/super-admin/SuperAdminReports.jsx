import React, { useState } from 'react';
import { Paper, Typography, Box, Grid, Button, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import {
    Description,
    Download,
    BarChart,
    PieChart,
    TrendingUp,
    PictureAsPdf
} from '@mui/icons-material';

const SuperAdminReports = () => {
    const [loading, setLoading] = useState(null); // 'inventory_pdf', etc.

    const handleDownload = (type, format) => {
        const loadingKey = `${type}_${format}`;
        setLoading(loadingKey);

        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;
        
        // Special case for Global CSV export
        if (type === 'global_export') {
            const url = `${API_URL}/admin/reports/export?token=${token}`;
            window.open(url, '_blank');
        } else {
            const url = `${API_URL}/super-admin/reports/${type}?format=${format}&token=${token}`;
            window.open(url, '_blank');
        }
        
        // Reset loading after a delay
        setTimeout(() => setLoading(null), 1000);
    };

    const reportCards = [
        {
            id: 'inventory',
            title: 'Inventory Report',
            desc: 'List products with how many RMAs they have.',
            icon: <BarChart sx={{ fontSize: 40, color: '#1976d2' }} />,
            bg: '#e3f2fd'
        },
        {
            id: 'staff-performance',
            title: 'Staff Performance',
            desc: 'List staff with how many status changes they performed.',
            icon: <TrendingUp sx={{ fontSize: 40, color: '#2e7d32' }} />,
            bg: '#e8f5e9'
        },
        {
            id: 'financial',
            title: 'Financial Summary',
            desc: 'Show total RMAs, total returns value, and refunds.',
            icon: <PieChart sx={{ fontSize: 40, color: '#ed6c02' }} />,
            bg: '#fff3e0'
        }
    ];

    return (
        <Box sx={{ p: 4, backgroundColor: '#f8fafc', minHeight: '100vh', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
                        System Reports
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Generate and export detailed analysis of your RMA ecosystem.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={loading === 'global_export_csv' ? <CircularProgress size={16} sx={{color: 'white'}} /> : <Download />} 
                    disabled={!!loading}
                    onClick={() => handleDownload('global_export', 'csv')}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                    Global Export
                </Button>
            </Box>

            <Grid container spacing={4}>
                {reportCards.map((report, index) => (
                    <Grid item xs={12} md={4} key={index}>
                        <Card sx={{ 
                            borderRadius: 6, 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.04)', 
                            height: '100%', 
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                            }
                        }}>
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
                                <Typography variant="body2" sx={{ color: '#64748b', mb: 3, height: 40 }}>
                                    {report.desc}
                                </Typography>
                                <Divider sx={{ mb: 3, opacity: 0.5 }} />
                                <Box display="flex" gap={2} justifyContent="center">
                                    <Button 
                                        variant="outlined" 
                                        startIcon={loading === `${report.id}_pdf` ? <CircularProgress size={16} /> : <PictureAsPdf />} 
                                        size="small" 
                                        disabled={!!loading}
                                        onClick={() => handleDownload(report.id, 'pdf')}
                                        sx={{ 
                                            borderRadius: 2, 
                                            textTransform: 'none', 
                                            fontWeight: 600,
                                            borderColor: '#e2e8f0',
                                            color: '#475569',
                                            px: 2
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={loading === `${report.id}_csv` ? <CircularProgress size={16} /> : <Download />} 
                                        size="small" 
                                        disabled={!!loading}
                                        onClick={() => handleDownload(report.id, 'csv')}
                                        sx={{ 
                                            borderRadius: 2, 
                                            textTransform: 'none', 
                                            fontWeight: 600,
                                            borderColor: '#e2e8f0',
                                            color: '#475569',
                                            px: 2
                                        }}
                                    >
                                        CSV
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            <Box mt={6} p={4} sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 6, border: '1px dashed #cbd5e1' }}>
                <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 700, mb: 1 }}>
                    Report Generation Notice
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    * PDF reports are optimized for printing and include branded headers. <br />
                    * CSV exports contain raw data compatible with Microsoft Excel and Google Sheets. <br />
                    * Statistics are calculated in real-time based on the current database state.
                </Typography>
            </Box>
        </Box>
    );
};

export default SuperAdminReports;

