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
    Tab,
    Stack,
    Paper,
    Fade,
} from '@mui/material';
import { alpha } from "@mui/material/styles";
import {
    EmailOutlined,
    LocalPhoneOutlined,
    CalendarTodayOutlined,
    LocationOnOutlined,
    HistoryOutlined,
    ShoppingBagOutlined,
    AccountCircleOutlined,
    ContactMailOutlined,
    PublicOutlined,
    EditOutlined,
    Close,
} from '@mui/icons-material';

const InfoItem = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
        <Box sx={{
            display: 'flex',
            p: 1,
            borderRadius: 1.5,
            bgcolor: alpha('#1976d2', 0.05),
            color: 'primary.main'
        }}>
            <Icon fontSize="small" />
        </Box>
        <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.2 }}>
                {value || 'Not provided'}
            </Typography>
        </Box>
    </Box>
);

const CustomerDetails = ({ open, customer, onClose, onEdit }) => {
    const [tabValue, setTabValue] = useState(0);

    if (!customer) return null;

    const getInitials = () => {
        const firstName = customer.first_name || customer.firstName || '';
        const lastName = customer.last_name || customer.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const getFullName = () => {
        const firstName = customer.first_name || customer.firstName || '';
        const lastName = customer.last_name || customer.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Anonymous User';
    };

    const formatDate = (date) => {
        if (!date) return 'Not available';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
            <Box sx={{
                height: 120,
                background: `linear-gradient(135deg, ${alpha('#1976d2', 0.8)} 0%, ${alpha('#7b1fa2', 0.8)} 100%)`,
                position: 'relative'
            }}>
                <Button
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 16, right: 16, color: '#fff', minWidth: 40, width: 40, height: 40, borderRadius: '50%', '&:hover': { bgcolor: alpha('#fff', 0.1) } }}
                >
                    <Close />
                </Button>
            </Box>

            <Box sx={{ px: 4, position: 'relative', mt: -6, mb: 2 }}>
                <Stack direction="row" spacing={3} alignItems="flex-end">
                    <Avatar
                        sx={{
                            width: 110,
                            height: 110,
                            bgcolor: '#fff',
                            color: 'primary.main',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            border: '4px solid #fff'
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box sx={{ pb: 1, flexGrow: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: -1 }}>
                                    {getFullName()}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {customer.email}
                                </Typography>
                            </Box>
                            <Chip
                                label={customer.is_active ? 'Active Status' : 'Locked Account'}
                                sx={{
                                    height: 32,
                                    borderRadius: 2,
                                    fontWeight: 800,
                                    bgcolor: customer.is_active ? alpha('#2e7d32', 0.1) : alpha('#d32f2f', 0.1),
                                    color: customer.is_active ? '#2e7d32' : '#d32f2f',
                                    border: '1px solid',
                                    borderColor: customer.is_active ? alpha('#2e7d32', 0.2) : alpha('#d32f2f', 0.2)
                                }}
                            />
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 100, fontSize: '0.95rem' }
                    }}
                >
                    <Tab icon={<AccountCircleOutlined sx={{ fontSize: 20 }} />} iconPosition="start" label="Profile Overview" />
                    <Tab icon={<ShoppingBagOutlined sx={{ fontSize: 20 }} />} iconPosition="start" label="Transactions" />
                    <Tab icon={<HistoryOutlined sx={{ fontSize: 20 }} />} iconPosition="start" label="RMA Logs" />
                </Tabs>
            </Box>

            <DialogContent sx={{ p: 4 }}>
                <Fade in={true}>
                    <Box>
                        {tabValue === 0 && (
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ContactMailOutlined fontSize="small" /> Communication Details
                                    </Typography>
                                    <InfoItem icon={EmailOutlined} label="Primary Email" value={customer.email} />
                                    <InfoItem icon={LocalPhoneOutlined} label="Mobile Number" value={customer.phone} />
                                    <InfoItem icon={CalendarTodayOutlined} label="Member Since" value={formatDate(customer.created_at || customer.createdAt)} />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOnOutlined fontSize="small" /> Location Mapping
                                    </Typography>
                                    <InfoItem icon={LocationOnOutlined} label="Full Address" value={customer.address} />
                                    <InfoItem icon={PublicOutlined} label="Territory" value={customer.country} />
                                    <InfoItem icon={LocationOnOutlined} label="City Region" value={customer.city} />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.3), borderStyle: 'dashed' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Internal Notes</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: customer.notes ? 'normal' : 'italic' }}>
                                            {customer.notes || 'No administrative notes have been recorded for this customer profile.'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}

                        {tabValue === 1 && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Paper sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: alpha('#ed6c02', 0.05), mb: 3 }}>
                                    <ShoppingBagOutlined sx={{ fontSize: 48, color: '#ed6c02' }} />
                                </Paper>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>No Recorded Transactions</Typography>
                                <Typography variant="body2" color="text.secondary">This account hasn't processed any sales yet.</Typography>
                            </Box>
                        )}

                        {tabValue === 2 && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Paper sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: alpha('#9c27b0', 0.05), mb: 3 }}>
                                    <HistoryOutlined sx={{ fontSize: 48, color: '#9c27b0' }} />
                                </Paper>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>RMA Archive Empty</Typography>
                                <Typography variant="body2" color="text.secondary">No return authorization requests found in our database.</Typography>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </DialogContent>

            <DialogActions sx={{ p: 3, px: 4, bgcolor: alpha('#f5f5f5', 0.5), borderTop: '1px solid', borderColor: 'divider' }}>
                <Button
                    onClick={onClose}
                    sx={{ fontWeight: 700, color: 'text.secondary' }}
                >
                    Dismiss
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditOutlined />}
                    onClick={() => onEdit(customer)}
                    sx={{
                        borderRadius: 2.5,
                        px: 4,
                        fontWeight: 800,
                        boxShadow: '0 8px 16px -4px rgba(25, 118, 210, 0.3)'
                    }}
                >
                    Modify Profile
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerDetails;