import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Grid, TextField, Button, Avatar, Alert, CircularProgress } from '@mui/material';
import Select from "react-select";
import countries_list from "country-list";
import { getCode } from 'country-list';
import authService from '../../services/api/authService';
import { useNavigate } from 'react-router-dom'

const countryOptions = countries_list.getData().map(country => ({
    value: getCode(country.name),
    label: country.name
})).sort((a, b) => a.label.localeCompare(b.label));

const ClientProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true); // ✅ Added for initial load
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                // ✅ Use authService to get current user
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

                // Update localStorage
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (err) {
                console.error("Failed to fetch user data", err);
                setError('Failed to load profile data');

                // ✅ Fallback to localStorage if API fails
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
            // ✅ Use authService.updateProfile
            const response = await authService.updateProfile(formData);
            setUser(response.user);
            setSuccess('Profile updated successfully!');

            setTimeout(() => {
                navigate('/client');
            }, 2000);
        }
        catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Show loading spinner while fetching initial data
    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const displayName = user.first_name ? `${user.first_name} ${user.last_name}` : user.name || 'Customer';

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                My Profile
            </Typography>

            <Grid container spacing={4}>
                {/* ✅ FIXED: Updated Grid syntax for MUI v6 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                margin: '0 auto',
                                mb: 2,
                                bgcolor: 'secondary.main',
                                fontSize: 40
                            }}
                        >
                            {displayName ? displayName.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">{displayName}</Typography>
                        <Typography color="text.secondary" gutterBottom>{user.email}</Typography>
                        <Typography variant="body2" sx={{ mt: 1, px: 2, py: 0.5, bgcolor: 'grey.100', borderRadius: 2, display: 'inline-block' }}>
                            Customer Account
                        </Typography>
                    </Paper>
                </Grid>

                {/* ✅ FIXED: Updated Grid syntax for MUI v6 */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Account Details
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Box component="form" onSubmit={handleSave} sx={{ mt: 2 }}>
                            <Grid container spacing={3}>
                                {/* ✅ FIXED: Updated Grid syntax for all Grid items */}
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
                                        Country
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
                                                background: 'transparent',
                                                borderColor: 'rgba(0, 0, 0, 0.23)',
                                                '&:hover': {
                                                    borderColor: 'rgba(0, 0, 0, 0.87)',
                                                },
                                            }),
                                            placeholder: (base) => ({
                                                ...base,
                                                color: 'rgba(0, 0, 0, 0.6)',
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
                                        label="Address"
                                        multiline
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{ borderRadius: 2, px: 4 }}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ClientProfile;