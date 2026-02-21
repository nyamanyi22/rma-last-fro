import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Typography,
    Box,
    Avatar,
    Divider,
    Chip,
    Tabs,
    Tab
} from '@mui/material';
import {
    Email,
    Phone,
    CalendarToday,
    LocationOn,
    History
} from '@mui/icons-material';

const CustomerDetails = ({ open, customer, onClose }) => {
    const [tabValue, setTabValue] = useState(0);

    if (!customer) return null;

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                    {customer.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="h6">{customer.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{customer.email}</Typography>
                </Box>
                <Chip
                    label={customer.status === 'banned' ? 'Banned' : 'Active'}
                    color={customer.status === 'banned' ? 'error' : 'success'}
                    size="small"
                    sx={{ ml: 'auto' }}
                />
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Profile Info" />
                        <Tab label="RMA History" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Contact Information</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Email fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Phone fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.phone || 'Not provided'}</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Details</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CalendarToday fontSize="small" color="action" />
                                    <Typography variant="body2">Joined: {new Date(customer.joinedDate).toLocaleDateString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body2">{customer.address || 'No address on file'}</Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                    No internal notes for this customer.
                                </Typography>
                            </Grid>
                        </Grid>
                    )}

                    {tabValue === 1 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No RMA History</Typography>
                            <Typography variant="body2" color="text.secondary">
                                This customer has not submitted any RMA requests yet.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" onClick={onClose}>
                    Edit Profile
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerDetails;
