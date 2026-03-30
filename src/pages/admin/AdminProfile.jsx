import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, TextField, Button, Avatar, Alert, CircularProgress, Chip, Snackbar } from '@mui/material';
import Select from "react-select";
import countries_list from "country-list";
import { getCode } from 'country-list';
import authService from '../../services/api/authService';
import { useNavigate } from 'react-router-dom';

const countryOptions = countries_list.getData().map(country => ({
    value: getCode(country.name),
    label: country.name
})).sort((a, b) => a.label.localeCompare(b.label));

const AdminProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [user, setUser] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        city: '',
        postalCode: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            setInitialLoading(true);
            try {
                const response = await authService.getCurrentUser();
                const userData = response.user || response;

                setUser(userData);
                setFormData({
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    country: userData.country || '',
                    address: userData.address || '',
                    city: userData.city || '',
                    postalCode: userData.postal_code || '',
                });

                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                console.error("Failed to fetch user data", err);
                setError('Failed to load profile data');

                const storedUser = authService.getUserFromStorage();
                if (storedUser) {
                    setUser(storedUser);
                    setFormData({
                        firstName: storedUser.first_name || '',
                        lastName: storedUser.last_name || '',
                        email: storedUser.email || '',
                        phone: storedUser.phone || '',
                        country: storedUser.country || '',
                        address: storedUser.address || '',
                        city: storedUser.city || '',
                        postalCode: storedUser.postal_code || '',
                    });
                }
            } finally {
                setInitialLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authService.updateProfile(formData);
            setUser(response.user);
            setSuccess('Profile updated successfully!');
            setSnackbarOpen(true);
            
            // Update local storage name immediately for layout sync
            const updatedLocalUser = { ...JSON.parse(localStorage.getItem('user')), ...response.user };
            localStorage.setItem('user', JSON.stringify(updatedLocalUser));

        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const displayName = user.first_name ? `${user.first_name} ${user.last_name}` : user.name || 'Administrator';
    const roleLabel = user.role === 'super_admin' ? 'Super Administrator' : (user.role === 'admin' ? 'Administrator' : 'Staff');

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                System Profile
            </Typography>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                margin: '0 auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: 48,
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{displayName}</Typography>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
                        
                        <Chip 
                            label={roleLabel} 
                            color="primary" 
                            variant="outlined" 
                            sx={{ fontWeight: 'bold', borderRadius: 2 }} 
                        />
                        
                        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                            <Typography variant="body2" color="text.secondary">
                                Member since: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                            Profile Information
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box component="form" onSubmit={handleSave}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        name="firstName"
                                        label="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        name="lastName"
                                        label="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={formData.email}
                                        disabled
                                        helperText="Email cannot be changed for administrative accounts."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        name="phone"
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        name="city"
                                        label="City"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        fullWidth
                                        name="postalCode"
                                        label="Postal Code"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                        Country / Region
                                    </Typography>
                                    <Select
                                        options={countryOptions}
                                        placeholder="Select Country"
                                        isSearchable
                                        isDisabled={loading}
                                        value={countryOptions.find(c => c.value === formData.country) || null}
                                        onChange={(option) => {
                                            setFormData({
                                                ...formData,
                                                country: option ? option.value : ""
                                            });
                                        }}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                minHeight: '56px',
                                                borderRadius: '4px',
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                '&:hover': {
                                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                                },
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                zIndex: 1500,
                                            })
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        name="address"
                                        label="Work / Home Address"
                                        multiline
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{ borderRadius: 2, px: 6, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
                    Admin profile updated successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminProfile;
