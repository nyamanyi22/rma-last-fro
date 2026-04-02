import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, Button, TextField, Grid, FormControlLabel, Switch, CircularProgress, Alert, Fade } from '@mui/material';
import superAdminService from '../../services/api/superAdminService';

const SuperAdminSecurity = () => {
    const [settings, setSettings] = useState({
        password_min_length: 8,
        password_expiry_days: 90,
        admin_2fa_enforced: false
    });
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(""), 5000);
    };

    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await superAdminService.getSettings();
            if (response.success && response.data) {
                setSettings({
                    password_min_length: response.data.password_min_length || 8,
                    password_expiry_days: response.data.password_expiry_days || 90,
                    admin_2fa_enforced: response.data.admin_2fa_enforced === "1" || response.data.admin_2fa_enforced === true
                });
            }
        } catch (error) {
            showError("Failed to load security settings");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSavePasswordPolicy = async () => {
        setSaving(true);
        try {
            const response = await superAdminService.updateSettings({
                password_min_length: settings.password_min_length,
                password_expiry_days: settings.password_expiry_days
            });
            if (response.success) {
                showSuccess("Password policy updated successfully");
            }
        } catch (error) {
            showError("Failed to update password policy");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle2FA = async (e) => {
        const newValue = e.target.checked;
        setSettings(prev => ({ ...prev, admin_2fa_enforced: newValue }));
        
        try {
            const response = await superAdminService.updateSettings({
                admin_2fa_enforced: newValue
            });
            if (response.success) {
                showSuccess(`2FA enforcement ${newValue ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            // Revert on failure
            setSettings(prev => ({ ...prev, admin_2fa_enforced: !newValue }));
            showError("Failed to update 2FA configuration");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Security & Access Control
            </Typography>

            <Fade in={!!successMessage}>
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2, display: successMessage ? 'flex' : 'none' }}>
                    {successMessage}
                </Alert>
            </Fade>
            <Fade in={!!errorMessage}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, display: errorMessage ? 'flex' : 'none' }}>
                    {errorMessage}
                </Alert>
            </Fade>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Password Policy
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Minimum Password Length"
                                type="number"
                                name="password_min_length"
                                value={settings.password_min_length || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                            <TextField
                                fullWidth
                                label="Password Expiry (days)"
                                type="number"
                                name="password_expiry_days"
                                value={settings.password_expiry_days || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                            <Button 
                                variant="contained" 
                                sx={{ mt: 2 }} 
                                onClick={handleSavePasswordPolicy}
                                disabled={saving}
                            >
                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Policy'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                            Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Enforce 2FA for all admin accounts.
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={settings.admin_2fa_enforced}
                                        onChange={handleToggle2FA}
                                        name="admin_2fa_enforced"
                                        color="primary"
                                    />
                                }
                                label="Enable Global 2FA Enforcement"
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SuperAdminSecurity;
