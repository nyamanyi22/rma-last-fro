import React from 'react';
import { Paper, Typography, Box, Grid } from '@mui/material';

const SuperAdminReports = () => {
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                System Reports
            </Typography>

            <Grid container spacing={3}>
                {[1, 2, 3].map((item) => (
                    <Grid item xs={12} md={4} key={item}>
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.50',
                                border: '2px dashed',
                                borderColor: 'grey.300'
                            }}
                        >
                            <Typography color="text.secondary">
                                Report Widget {item} Placeholder
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SuperAdminReports;
