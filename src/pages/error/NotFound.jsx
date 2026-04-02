import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowBack, SentimentVeryDissatisfied } from '@mui/icons-material';

const NotFound = () => {
    const navigate = useNavigate();
    const PRIMARY = '#6366f1';
    const SECONDARY = '#a855f7';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 90.2%)',
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
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Decorative Elements */}
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: `${PRIMARY}15` }} />
                    <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, borderRadius: '50%', background: `${SECONDARY}15` }} />

                    <Box sx={{ mb: 4, position: 'relative' }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '8rem', md: '12rem' },
                                fontWeight: 900,
                                background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1,
                                opacity: 0.15
                            }}
                        >
                            404
                        </Typography>
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <SentimentVeryDissatisfied sx={{ fontSize: 80, color: PRIMARY, mb: 2 }} />
                        </Box>
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 2, letterSpacing: '-0.5px' }}>
                        Lost in Space?
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mb: 5, maxWidth: '400px', mx: 'auto' }}>
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Home />}
                            onClick={() => navigate('/')}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                bgcolor: PRIMARY,
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: `0 10px 20px -5px ${PRIMARY}44`,
                                '&:hover': { bgcolor: '#4f46e5', boxShadow: `0 15px 25px -5px ${PRIMARY}66` }
                            }}
                        >
                            Go Home
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<ArrowBack />}
                            onClick={() => navigate(-1)}
                            sx={{
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                color: '#475569',
                                borderColor: '#e2e8f0',
                                fontWeight: 700,
                                textTransform: 'none',
                                '&:hover': { borderColor: '#cbd5e1', bgcolor: 'rgba(0,0,0,0.02)' }
                            }}
                        >
                            Back
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default NotFound;
