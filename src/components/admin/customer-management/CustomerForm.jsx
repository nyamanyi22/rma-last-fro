import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Grid,
    FormControlLabel,
    Switch,
    InputAdornment,
    Divider,
    Stack,
    Paper,
    Fade,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Select from "react-select";
import { getData } from "country-list";
import {
    Save,
    Cancel,
    AssignmentIndOutlined,
    ContactMailOutlined,
    SecurityOutlined,
    PersonOutline,
    EmailOutlined,
    VpnKeyOutlined,
    LocalPhoneOutlined,
    PublicOutlined,
    LocationOnOutlined,
    HomeOutlined,
    MarkunreadMailboxOutlined,
} from "@mui/icons-material";

const countryOptions = getData().map((country) => ({
    value: country.code,
    label: country.name,
})).sort((a, b) => a.label.localeCompare(b.label));

const FormSection = ({ icon: Icon, title, children }) => (
    <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
            <Box sx={{
                display: 'flex',
                p: 1,
                borderRadius: 2,
                bgcolor: alpha('#1976d2', 0.1),
                color: 'primary.main'
            }}>
                <Icon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
                {title}
            </Typography>
        </Stack>
        <Grid container spacing={2.5}>
            {children}
        </Grid>
    </Box>
);

const CustomerForm = ({ customer, mode, onSave, onCancel, loading, errors: backendErrors = {} }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        country: "",
        address: "",
        city: "",
        postalCode: "",
        isActive: true,
    });
    const [localErrors, setLocalErrors] = useState({});

    // Map backend keys to frontend keys
    const errorMapping = {
        first_name: 'firstName',
        last_name: 'lastName',
        email: 'email',
        password: 'password',
        phone: 'phone',
        country: 'country',
        address: 'address',
        city: 'city',
        postal_code: 'postalCode'
    };

    // Combine local and backend errors
    const getFieldError = (fieldName) => {
        if (localErrors[fieldName]) return localErrors[fieldName];

        // Find if any backend error maps to this field
        const backendKey = Object.keys(errorMapping).find(key => errorMapping[key] === fieldName);
        if (backendKey && backendErrors[backendKey]) {
            return backendErrors[backendKey][0];
        }

        // Also check if field name matches backend key exactly
        if (backendErrors[fieldName]) {
            return backendErrors[fieldName][0];
        }

        return null;
    };

    useEffect(() => {
        if (customer && mode === "edit") {
            setFormData({
                firstName: customer.first_name || "",
                lastName: customer.last_name || "",
                email: customer.email || "",
                password: "",
                confirmPassword: "",
                phone: customer.phone || "",
                country: customer.country || "",
                address: customer.address || "",
                city: customer.city || "",
                postalCode: customer.postal_code || "",
                isActive: customer.is_active ?? true,
            });
        } else {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                phone: "",
                country: "",
                address: "",
                city: "",
                postalCode: "",
                isActive: true,
            });
        }
        setLocalErrors({});
    }, [customer, mode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        // Clear error for this field
        if (localErrors[name]) {
            const newErrors = { ...localErrors };
            delete newErrors[name];
            setLocalErrors(newErrors);
        }
    };

    const handleCountryChange = (option) => {
        const value = option ? option.value : "";
        setFormData({
            ...formData,
            country: value,
        });
        if (localErrors.country) {
            const newErrors = { ...localErrors };
            delete newErrors.country;
            setLocalErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = "First name is required";
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.email) newErrors.email = "Email address is required";

        if (mode === "create" && !formData.password) {
            newErrors.password = "Security password is required for new accounts";
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Password confirmation does not match";
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = "Security password must be at least 6 characters";
        }

        setLocalErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submitData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            country: formData.country || null,
            address: formData.address || null,
            city: formData.city || null,
            postalCode: formData.postalCode || null,
            isActive: formData.isActive,
        };

        if (formData.password) {
            submitData.password = formData.password;
        }

        onSave(submitData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <FormSection icon={AssignmentIndOutlined} title="Identity & Security">
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        required
                        fullWidth
                        name="firstName"
                        label="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('firstName')}
                        helperText={getFieldError('firstName')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonOutline fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        required
                        fullWidth
                        name="lastName"
                        label="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('lastName')}
                        helperText={getFieldError('lastName')}
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        required
                        fullWidth
                        name="email"
                        label="Email Identity"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('email')}
                        helperText={getFieldError('email')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        name="password"
                        label={mode === "create" ? "Security Password *" : "Replace Password"}
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('password')}
                        helperText={getFieldError('password') || (mode === "create" ? "Min. 6 characters" : "Leave blank to keep same")}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <VpnKeyOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Code"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('confirmPassword')}
                        helperText={getFieldError('confirmPassword')}
                        InputProps={{ sx: { borderRadius: 3 } }}
                    />
                </Grid>
            </FormSection>

            <FormSection icon={ContactMailOutlined} title="Global Contact & Location">
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        name="phone"
                        label="Mobile Number"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('phone')}
                        helperText={getFieldError('phone')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocalPhoneOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color={getFieldError('country') ? 'error' : 'text.secondary'} sx={{ display: 'block', mb: 0.5, fontWeight: 700, pl: 1 }}>
                        Country Region {getFieldError('country') && ` - ${getFieldError('country')}`}
                    </Typography>
                    <Select
                        options={countryOptions}
                        placeholder="Select Territory"
                        isSearchable
                        isDisabled={loading}
                        value={countryOptions.find(c => c.value === formData.country) || null}
                        onChange={handleCountryChange}
                        styles={{
                            control: (base) => ({
                                ...base,
                                minHeight: '45px',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: getFieldError('country') ? '#d32f2f' : alpha('#000', 0.15),
                                '&:hover': { borderColor: getFieldError('country') ? '#d32f2f' : alpha('#1976d2', 0.5) },
                                boxShadow: 'none'
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 1500,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            })
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        name="city"
                        label="City"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('city')}
                        helperText={getFieldError('city')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocationOnOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        fullWidth
                        name="postalCode"
                        label="Postal Indicator"
                        value={formData.postalCode}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('postalCode')}
                        helperText={getFieldError('postalCode')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MarkunreadMailboxOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
                <Grid size={12}>
                    <TextField
                        fullWidth
                        name="address"
                        label="Street Address"
                        multiline
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!getFieldError('address')}
                        helperText={getFieldError('address')}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                    <HomeOutlined fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />
                </Grid>
            </FormSection>

            <FormSection icon={SecurityOutlined} title="Portal Access Configuration">
                <Grid size={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.5), borderStyle: 'dashed' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    color="success"
                                    disabled={loading}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Account Privileges</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Grant or revoke customer access to the RMA platform and store features.
                                    </Typography>
                                </Box>
                            }
                        />
                    </Paper>
                </Grid>
            </FormSection>

            <Divider sx={{ my: 4, opacity: 0.6 }} />

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                    onClick={onCancel}
                    disabled={loading}
                    sx={{ borderRadius: 2.5, px: 3, fontWeight: 700, color: 'text.secondary' }}
                >
                    Discard
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                        borderRadius: 2.5,
                        px: 5,
                        fontWeight: 800,
                        boxShadow: '0 8px 20px -6px rgba(25, 118, 210, 0.4)',
                        textTransform: 'none'
                    }}
                >
                    {loading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : mode === "create" ? (
                        "Validate & Create Account"
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </Stack>
        </Box>
    );
};

export default CustomerForm;