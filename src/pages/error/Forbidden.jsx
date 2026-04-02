import React from 'react';
import { Box, Typography, Button, Container, Paper, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Security, LockOutlined, Logout } from '@mui/icons-material';

const Forbidden = () => {
    const navigate = useNavigate();
    const PRIMARY = '#ef4444'; // Red for restricted access
    const ACCENT = '#6366f1';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                p: 3
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 8 },
                        textAlign: 'center',
                        borderRadius: 8,
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(239, 68, 68, 0.1)',
                        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Error Symbol */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(239, 68, 68, 0.2)',
                                position: 'relative'
                            }}
                        >
                            <Security sx={{ fontSize: 60, color: PRIMARY }} />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: PRIMARY,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    border: '3px solid #fff'
                                }}
                            >
                                <LockOutlined sx={{ fontSize: 20, color: '#fff' }} />
                            </Box>
                        </Box>
                    </Box>

                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', mb: 2, letterSpacing: '-1px' }}>
                        Restricted Access
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 5, maxWidth: '450px', mx: 'auto', lineHeight: 1.7 }}>
                        Oops! You don’t have the necessary permits to enter this area. This page is restricted to authorized personnel only.
                    </Typography>

                    <Stack spacing={2} sx={{ maxWidth: '300px', mx: 'auto' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                bgcolor: '#0f172a',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#1e293b' }
                            }}
                        >
                            Back to Safety
                        </Button>
                        <Button
                            variant="text"
                            size="large"
                            startIcon={<Logout />}
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                color: PRIMARY,
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { background: 'rgba(239, 68, 68, 0.05)' }
                            }}
                        >
                            Log Out
                        </Button>
                    </Stack>

                    <Typography variant="caption" sx={{ mt: 5, display: 'block', color: '#94a3b8', fontStyle: 'italic' }}>
                        Access denied on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Forbidden;
