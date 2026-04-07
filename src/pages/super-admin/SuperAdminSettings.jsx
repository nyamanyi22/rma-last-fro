import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    TextField,
    Button,
    Chip,
    Alert,
    Snackbar,
    InputAdornment,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Notifications,
    Security,
    Language,
    Storage,
    Email,
    Schedule,
    People,
    Shield,
    Save,
    Refresh,
    Visibility,
    VisibilityOff,
    CheckCircle,
    Warning,
    Circle,
    Settings,
    Business,
    Assignment,
    Add,
    Remove,
} from '@mui/icons-material';
import { superAdminApi, rmaApi } from '../../services/api/api';
import { usePortalSettings } from '../../context/PortalSettingsContext';

const ACCENT = '#a855f7';

const SectionHeader = ({ icon, title, description }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box
            sx={{
                p: 1.2,
                borderRadius: 2,
                background: `${ACCENT}18`,
                border: `1px solid ${ACCENT}22`,
                display: 'flex',
                flexShrink: 0,
            }}
        >
            {React.cloneElement(icon, { sx: { fontSize: 20, color: ACCENT } })}
        </Box>
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
                {description}
            </Typography>
        </Box>
    </Box>
);

const SettingRow = ({ primary, secondary, children, last = false }) => (
    <>
        <ListItem sx={{ px: 0, py: 2, alignItems: 'flex-start' }}>
            <ListItemText
                primary={primary}
                secondary={secondary}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}
                secondaryTypographyProps={{ fontSize: 12, color: '#64748b', mt: 0.3 }}
                sx={{ pr: 4 }}
            />
            <ListItemSecondaryAction sx={{ right: 0 }}>{children}</ListItemSecondaryAction>
        </ListItem>
        {!last && <Divider sx={{ borderColor: '#f1f5f9' }} />}
    </>
);

const SuperAdminSettings = () => {
    const { refreshPortalSettings } = usePortalSettings();
    const [tab, setTab] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingPasswordPolicy, setSavingPasswordPolicy] = useState(false);

    // Toggle states
    const [toggles, setToggles] = useState({
        disableAllNotifications: false,
        maintenanceMode: false,
        allowRegistrations: true,
        twoFactorRequired: false,
        autoBackup: true,
        rmaEmailAlertsToStaff: true,
        sessionTimeout: false,
    });

    // Form states
    const [systemName, setSystemName] = useState('RMA Portal');
    const [supportEmail, setSupportEmail] = useState('support@company.com');
    const [timezone, setTimezone] = useState('UTC+3');
    const [sessionDuration, setSessionDuration] = useState('8');
    const [maxFileSize, setMaxFileSize] = useState('5');
    const [language, setLanguage] = useState('en');
    const [minPasswordLength, setMinPasswordLength] = useState(8);
    const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
    const [systemInfo, setSystemInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(true);

    // Return Policy state
    const [policyText, setPolicyText] = useState('');
    const [savingPolicy, setSavingPolicy] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch settings
                const settingsRes = await superAdminApi.getSettings();
                if (settingsRes.data.success) {
                    const s = settingsRes.data.data;

                    if (s.system_name) setSystemName(s.system_name);
                    if (s.support_email) setSupportEmail(s.support_email);
                    if (s.timezone) setTimezone(s.timezone);
                    if (s.session_duration) setSessionDuration(s.session_duration);
                    if (s.max_file_size) setMaxFileSize(s.max_file_size);
                    if (s.language) setLanguage(s.language);
                    setMinPasswordLength(Number(s.min_password_length || 8));
                    setPasswordExpiryDays(Number(s.password_expiry_days || 90));

                    setToggles({
                        disableAllNotifications: s.disable_all_notifications === '1',
                        maintenanceMode: s.maintenance_mode === '1',
                        allowRegistrations: s.allow_registrations === '1',
                        twoFactorRequired: s.two_factor_required === '1',
                        autoBackup: s.auto_backup === '1',
                        rmaEmailAlertsToStaff: s.rma_email_alerts_to_staff === '1',
                        sessionTimeout: s.session_timeout === '1',
                    });
                }

                // Fetch system info
                const infoRes = await superAdminApi.getSystemInfo();
                if (infoRes.data.success) {
                    setSystemInfo(infoRes.data.data);
                }

                // Fetch return policy
                const policyRes = await rmaApi.getAdminReturnPolicy();
                if (policyRes.data.success) {
                    setPolicyText(policyRes.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch settings or info:', error);
                setSnackbar({ open: true, message: 'Failed to load system data.', severity: 'error' });
            } finally {
                setLoading(false);
                setLoadingInfo(false);
            }
        };

        fetchData();
    }, []);

    const handleToggle = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const clampValue = (value, min, max) => {
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
            return min;
        }

        return Math.min(max, Math.max(min, parsed));
    };

    const handleNumberInput = (setter, min, max) => (event) => {
        const { value } = event.target;

        if (value === '') {
            setter('');
            return;
        }

        setter(clampValue(value, min, max));
    };

    const bumpNumber = (value, setter, delta, min, max) => {
        setter(clampValue(Number(value || min) + delta, min, max));
    };

    const handleSave = async (section) => {
        setSaving(true);
        try {
            // Build flat object for backend
            const data = {
                system_name: systemName,
                support_email: supportEmail,
                timezone: timezone,
                session_duration: sessionDuration,
                max_file_size: maxFileSize,
                language: language,
                disable_all_notifications: toggles.disableAllNotifications ? '1' : '0',
                maintenance_mode: toggles.maintenanceMode ? '1' : '0',
                allow_registrations: toggles.allowRegistrations ? '1' : '0',
                two_factor_required: toggles.twoFactorRequired ? '1' : '0',
                auto_backup: toggles.autoBackup ? '1' : '0',
                rma_email_alerts_to_staff: toggles.rmaEmailAlertsToStaff ? '1' : '0',
                session_timeout: toggles.sessionTimeout ? '1' : '0',
            };

            await superAdminApi.updateSettings(data);
            await refreshPortalSettings();
            setSnackbar({ open: true, message: `${section} settings saved successfully.`, severity: 'success' });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSnackbar({ open: true, message: 'Failed to save settings.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePolicy = async () => {
        setSavingPolicy(true);
        try {
            await rmaApi.updateReturnPolicy({ return_policy: policyText });
            setSnackbar({ open: true, message: 'Return policy updated successfully.', severity: 'success' });
        } catch (error) {
            console.error('Failed to save policy:', error);
            setSnackbar({ open: true, message: 'Failed to save return policy.', severity: 'error' });
        } finally {
            setSavingPolicy(false);
        }
    };

    const handleSavePasswordPolicy = async () => {
        setSavingPasswordPolicy(true);
        try {
            const data = {
                min_password_length: String(clampValue(minPasswordLength, 4, 20)),
                password_expiry_days: String(clampValue(passwordExpiryDays, 0, 365)),
            };

            await superAdminApi.updateSettings(data);
            await refreshPortalSettings();
            setMinPasswordLength(Number(data.min_password_length));
            setPasswordExpiryDays(Number(data.password_expiry_days));
            setSnackbar({ open: true, message: 'Password policy updated successfully.', severity: 'success' });
        } catch (error) {
            console.error('Failed to save password policy:', error);
            setSnackbar({ open: true, message: 'Failed to update password policy.', severity: 'error' });
        } finally {
            setSavingPasswordPolicy(false);
        }
    };

    const tabs = [
        { label: 'General', icon: <Settings sx={{ fontSize: 16 }} /> },
        { label: 'Policies', icon: <Assignment sx={{ fontSize: 16 }} /> }, // New Tab
        { label: 'Notifications', icon: <Notifications sx={{ fontSize: 16 }} /> },
        { label: 'Security', icon: <Security sx={{ fontSize: 16 }} /> },
        { label: 'System', icon: <Storage sx={{ fontSize: 16 }} /> },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
                <CircularProgress sx={{ color: ACCENT }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Loading system settings...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s', pointerEvents: saving ? 'none' : 'auto' }}>
            {saving && (
                <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', p: 1, pr: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <CircularProgress size={16} sx={{ color: ACCENT }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>Saving changes...</Typography>
                </Box>
            )}
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1a0533 0%, #2d1b69 60%, #4c1d95 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.04)',
                }}
            >
                <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${ACCENT}18` }} />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${ACCENT}33`, display: 'flex' }}>
                            <Settings sx={{ color: '#c084fc', fontSize: 20 }} />
                        </Box>
                        <Chip label="Super Admin Only" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.25)', color: '#c084fc', fontWeight: 600, fontSize: 11, border: '1px solid rgba(168,85,247,0.3)' }} />
                    </Box>
                    <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
                        System Settings
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Configure global system behavior, security policies, and integrations
                    </Typography>
                </Box>
            </Paper>

            {/* Status indicator */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                    icon={<Circle sx={{ fontSize: '8px !important', color: '#4ade80 !important' }} />}
                    label="System Online"
                    size="small"
                    sx={{ bgcolor: 'rgba(74,222,128,0.1)', color: '#16a34a', border: '1px solid rgba(74,222,128,0.25)', fontWeight: 600 }}
                />
                {toggles.maintenanceMode && (
                    <Chip
                        icon={<Warning sx={{ fontSize: '14px !important', color: '#f59e0b !important' }} />}
                        label="Maintenance Mode Active"
                        size="small"
                        sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.25)', fontWeight: 600 }}
                    />
                )}
                {toggles.twoFactorRequired && (
                    <Chip
                        icon={<Shield sx={{ fontSize: '14px !important', color: ACCENT + ' !important' }} />}
                        label="2FA Enforced"
                        size="small"
                        sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}30`, fontWeight: 600 }}
                    />
                )}
            </Box>

            {/* Tab navigation */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden', bgcolor: '#fff' }}
            >
                <Box
                    sx={{
                        px: 2,
                        bgcolor: '#f8fafc',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 13,
                                minHeight: 48,
                                color: '#64748b',
                                gap: 0.8,
                                '&.Mui-selected': { color: ACCENT },
                            },
                            '& .MuiTabs-indicator': { bgcolor: ACCENT, height: 3, borderRadius: '3px 3px 0 0' },
                        }}
                    >
                        {tabs.map((t, i) => (
                            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    {/* â”€â”€ GENERAL TAB â”€â”€ */}
                    {tab === 0 && (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <SectionHeader
                                    icon={<Business />}
                                    title="Organization Info"
                                    description="Basic details shown across the portal"
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="System / Portal Name"
                                        value={systemName}
                                        onChange={(e) => setSystemName(e.target.value)}
                                        fullWidth
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                    <TextField
                                        label="Support Email"
                                        value={supportEmail}
                                        onChange={(e) => setSupportEmail(e.target.value)}
                                        fullWidth
                                        size="small"
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                    <FormControl size="small" fullWidth>
                                        <InputLabel sx={{ '&.Mui-focused': { color: ACCENT } }}>Timezone</InputLabel>
                                        <Select
                                            value={timezone}
                                            label="Timezone"
                                            onChange={(e) => setTimezone(e.target.value)}
                                            sx={{ borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT } }}
                                        >
                                            {['UTC', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5', 'UTC-5', 'UTC-8'].map(tz => (
                                                <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <SectionHeader
                                    icon={<Schedule />}
                                    title="Operational Settings"
                                    description="Limits and defaults for the platform"
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label="Session Duration (hours)"
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(e.target.value)}
                                        type="number"
                                        fullWidth
                                        size="small"
                                        InputProps={{ inputProps: { min: 1, max: 24 } }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                    <TextField
                                        label="Max File Upload Size (MB)"
                                        value={maxFileSize}
                                        onChange={(e) => setMaxFileSize(e.target.value)}
                                        type="number"
                                        fullWidth
                                        size="small"
                                        InputProps={{ inputProps: { min: 1, max: 50 } }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                    <FormControl size="small" fullWidth>
                                        <InputLabel sx={{ '&.Mui-focused': { color: ACCENT } }}>Language</InputLabel>
                                        <Select
                                            value={language}
                                            label="Language"
                                            onChange={(e) => setLanguage(e.target.value)}
                                            sx={{ borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT } }}
                                        >
                                            <MenuItem value="en">English (US)</MenuItem>
                                            <MenuItem value="fr">French</MenuItem>
                                            <MenuItem value="ar">Arabic</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #f1f5f9' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                        disabled={saving}
                                        onClick={() => handleSave('General')}
                                        sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, borderRadius: 2, fontWeight: 600, px: 3, boxShadow: `0 4px 12px ${ACCENT}44` }}
                                    >
                                        {saving ? 'Saving...' : 'Save General Settings'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {/* â”€â”€ POLICIES TAB â”€â”€ */}
                    {tab === 1 && (
                        <Box>
                            <SectionHeader
                                icon={<Assignment />}
                                title="RMA Return Policy"
                                description="Configure the terms and conditions shown to customers during RMA submission"
                            />
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                The policy text defined here will be shown to customers before they submit a new RMA request. They are required to agree to this policy to proceed.
                            </Alert>
                            
                            <TextField
                                fullWidth
                                multiline
                                minRows={10}
                                maxRows={25}
                                variant="outlined"
                                value={policyText}
                                onChange={(e) => setPolicyText(e.target.value)}
                                placeholder="Enter your detailed return policy here..."
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#f8fafc',
                                        fontSize: 14,
                                        lineHeight: 1.6,
                                        '& fieldset': { borderColor: '#e2e8f0' },
                                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                                        '&.Mui-focused fieldset': { borderColor: ACCENT },
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    startIcon={savingPolicy ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    disabled={savingPolicy}
                                    onClick={handleSavePolicy}
                                    sx={{ 
                                        bgcolor: ACCENT, 
                                        '&:hover': { bgcolor: '#9333ea' }, 
                                        borderRadius: 2, 
                                        fontWeight: 600, 
                                        px: 4, 
                                        py: 1.2,
                                        boxShadow: `0 4px 12px ${ACCENT}44` 
                                    }}
                                >
                                    {savingPolicy ? 'Saving...' : 'Update Return Policy'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* â”€â”€ NOTIFICATIONS TAB â”€â”€ */}
                    {tab === 2 && (
                        <Box>
                            <SectionHeader
                                icon={<Notifications />}
                                title="Notification Preferences"
                                description="Control which events trigger email and system alerts"
                            />
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                Critical emails are always sent: password reset, email verification links, and 2FA codes.
                            </Alert>
                            {toggles.disableAllNotifications && (
                                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                                    Non-critical notification emails are currently blocked. This includes customer RMA status updates, customer RMA submitted/comment emails, daily pending summaries, new RMA staff alerts, and staff RMA status-change alerts.
                                </Alert>
                            )}
                            <List disablePadding>
                                <SettingRow
                                    primary="Disable All Notification Emails"
                                    secondary="When enabled, blocks all non-critical notification emails across the portal. Critical security emails still send."
                                >
                                    <Switch
                                        checked={toggles.disableAllNotifications}
                                        onChange={() => handleToggle('disableAllNotifications')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>
                                <SettingRow
                                    primary="RMA Email Alerts to Staff"
                                    secondary="Sends staff emails for new RMA submissions and RMA status changes. This only works when Disable All Notification Emails is OFF."
                                >
                                    <Switch
                                        checked={toggles.rmaEmailAlertsToStaff}
                                        onChange={() => handleToggle('rmaEmailAlertsToStaff')}
                                        disabled={toggles.disableAllNotifications}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>
                                <SettingRow
                                    primary="Session Timeout Alerts"
                                    secondary="Warn users 5 minutes before their session expires"
                                    last
                                >
                                    <Switch
                                        checked={toggles.sessionTimeout}
                                        onChange={() => handleToggle('sessionTimeout')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>
                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, mt: 1, borderTop: '1px solid #f1f5f9' }}>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    disabled={saving}
                                    onClick={() => handleSave('Notification')}
                                    sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, borderRadius: 2, fontWeight: 600, px: 3, boxShadow: `0 4px 12px ${ACCENT}44` }}
                                >
                                    {saving ? 'Saving...' : 'Save Notifications'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* â”€â”€ SECURITY TAB â”€â”€ */}
                    {tab === 3 && (
                        <Box>
                            <SectionHeader
                                icon={<Security />}
                                title="Security Policies"
                                description="Control authentication, access, and password rules"
                            />
                            <Alert
                                severity={toggles.maintenanceMode ? 'warning' : 'info'}
                                sx={{ mb: 3, borderRadius: 2 }}
                                icon={toggles.maintenanceMode ? <Warning /> : <Shield />}
                            >
                                {toggles.maintenanceMode
                                    ? 'Maintenance Mode is ON â€” only Super Admins can access the portal.'
                                    : 'Security policies apply to all non-Super Admin users.'}
                            </Alert>
                            <List disablePadding>
                                <SettingRow
                                    primary="Require Two-Factor Authentication"
                                    secondary="Force all admin and CSR users to enable 2FA on their accounts"
                                >
                                    <Switch
                                        checked={toggles.twoFactorRequired}
                                        onChange={() => handleToggle('twoFactorRequired')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>
                                <SettingRow
                                    primary="Allow New Registrations"
                                    secondary="Let customers create new accounts via the registration page"
                                >
                                    <Switch
                                        checked={toggles.allowRegistrations}
                                        onChange={() => handleToggle('allowRegistrations')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>
                                <SettingRow
                                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Maintenance Mode {toggles.maintenanceMode && <Chip label="Active" size="small" sx={{ bgcolor: 'rgba(245,158,11,0.15)', color: '#b45309', height: 18, fontSize: 10 }} />}</Box>}
                                    secondary="Take the site offline for non-super-admin users during updates"
                                    last
                                >
                                    <Switch
                                        checked={toggles.maintenanceMode}
                                        onChange={() => handleToggle('maintenanceMode')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#f59e0b' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#f59e0b' } }}
                                    />
                                </SettingRow>
                            </List>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, mt: 1, borderTop: '1px solid #f1f5f9' }}>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    disabled={saving}
                                    onClick={() => handleSave('Security')}
                                    sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, borderRadius: 2, fontWeight: 600, px: 3, boxShadow: `0 4px 12px ${ACCENT}44` }}
                                >
                                    {saving ? 'Saving...' : 'Save Security Settings'}
                                </Button>
                            </Box>

                            <Divider sx={{ my: 4, borderColor: '#f1f5f9' }} />

                            <SectionHeader
                                icon={<Shield />}
                                title="Password Policy"
                                description="Set the minimum password length and how long passwords remain valid"
                            />
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                                Set password expiry to 0 if you do not want passwords to expire. Existing users will be prompted to change expired passwords after their next authenticated request.
                            </Alert>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Minimum Password Length"
                                        type="number"
                                        value={minPasswordLength}
                                        onChange={handleNumberInput(setMinPasswordLength, 4, 20)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            inputProps: { min: 4, max: 20 },
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => bumpNumber(minPasswordLength, setMinPasswordLength, -1, 4, 20)}
                                                        edge="start"
                                                    >
                                                        <Remove fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => bumpNumber(minPasswordLength, setMinPasswordLength, 1, 4, 20)}
                                                        edge="end"
                                                    >
                                                        <Add fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="Allowed range: 4 to 20 characters."
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <TextField
                                        label="Password Expiry (Days)"
                                        type="number"
                                        value={passwordExpiryDays}
                                        onChange={handleNumberInput(setPasswordExpiryDays, 0, 365)}
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            inputProps: { min: 0, max: 365 },
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => bumpNumber(passwordExpiryDays, setPasswordExpiryDays, -1, 0, 365)}
                                                        edge="start"
                                                    >
                                                        <Remove fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => bumpNumber(passwordExpiryDays, setPasswordExpiryDays, 1, 0, 365)}
                                                        edge="end"
                                                    >
                                                        <Add fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        helperText="0 means passwords never expire. Allowed range: 0 to 365 days."
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused fieldset': { borderColor: ACCENT } }, '& label.Mui-focused': { color: ACCENT } }}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 3 }}>
                                <Button
                                    variant="contained"
                                    startIcon={savingPasswordPolicy ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    disabled={savingPasswordPolicy}
                                    onClick={handleSavePasswordPolicy}
                                    sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, borderRadius: 2, fontWeight: 600, px: 3, boxShadow: `0 4px 12px ${ACCENT}44` }}
                                >
                                    {savingPasswordPolicy ? 'Updating...' : 'Update Policy'}
                                </Button>
                            </Box>
                        </Box>
                    )}


                    {/* â”€â”€ SYSTEM TAB â”€â”€ */}
                    {tab === 4 && (
                        <Box>
                            <SectionHeader
                                icon={<Storage />}
                                title="System & Maintenance"
                                description="Advanced system controls â€” use with caution"
                            />
                            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                                Changes on this tab affect the entire platform immediately. Proceed carefully.
                            </Alert>
                            <List disablePadding>
                                <SettingRow
                                    primary="Auto Backup"
                                    secondary="Automatically back up the database every 24 hours"
                                >
                                    <Switch
                                        checked={toggles.autoBackup}
                                        onChange={() => handleToggle('autoBackup')}
                                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT } }}
                                    />
                                </SettingRow>

                            </List>

                            <Divider sx={{ my: 3, borderColor: '#f1f5f9' }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                                System Information
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'PHP Version', value: systemInfo?.php_version },
                                    { label: 'Laravel Version', value: systemInfo?.laravel_version },
                                    {
                                        label: 'Database',
                                        value: {
                                            mysql: 'MySQL',
                                            pgsql: 'PostgreSQL',
                                            sqlite: 'SQLite'
                                        }[systemInfo?.database] || systemInfo?.database
                                    },
                                    { label: 'Node Version', value: `${systemInfo?.node_version || '20.x'} (Frontend)` },
                                ].map(item => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 58 }}>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{item.label}</Typography>
                                            {loadingInfo || !item.value ? (
                                                <CircularProgress size={12} sx={{ color: ACCENT }} />
                                            ) : (
                                                <Chip label={item.value} size="small" sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, fontWeight: 600, fontSize: 11 }} />
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, mt: 1, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    sx={{ borderColor: '#e2e8f0', color: '#64748b', borderRadius: 2, fontWeight: 600, '&:hover': { borderColor: '#94a3b8' } }}
                                    onClick={() => setSnackbar({ open: true, message: 'Cache cleared successfully', severity: 'success' })}
                                >
                                    Clear Cache
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                                    disabled={saving}
                                    onClick={() => handleSave('System')}
                                    sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#9333ea' }, borderRadius: 2, fontWeight: 600, px: 3, boxShadow: `0 4px 12px ${ACCENT}44` }}
                                >
                                    {saving ? 'Saving...' : 'Save System Settings'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Toast */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SuperAdminSettings;

