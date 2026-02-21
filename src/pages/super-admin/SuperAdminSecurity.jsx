import React from 'react';
import { Paper, Typography, Box, Button, TextField, Grid } from '@mui/material';

const SuperAdminSecurity = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Security & Access Control
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Password Policy
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Minimum Password Length"
                                type="number"
                                defaultValue={8}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Password Expiry (days)"
                                type="number"
                                defaultValue={90}
                                margin="normal"
                            />
                            <Button variant="contained" sx={{ mt: 2 }}>
                                Update Policy
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Enforce 2FA for all admin accounts.
                        </Typography>
                        <Button variant="outlined" color="primary">
                            Configure 2FA
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SuperAdminSecurity;
