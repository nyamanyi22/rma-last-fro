import React, { useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Chip,
    Tooltip,
    useTheme,
    useMediaQuery,
    Badge,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    People,
    Settings,
    BarChart,
    ExitToApp,
    Assignment,
    Inventory,
    Receipt,
    Person,
    Notifications,
    ChevronLeft,
    Circle,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 260;
const collapsedWidth = 72;

const SIDEBAR_BG = 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)';
const ACCENT = '#6366f1';
const ACCENT_LIGHT = '#818cf8';

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setOpen(!open);
        }
    };

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
        { text: 'RMA Management', icon: <Assignment />, path: '/admin/rma' },
        ...(user.role !== 'csr' ? [
            { text: 'Products', icon: <Inventory />, path: '/admin/products' },
            { text: 'Customers', icon: <People />, path: '/admin/customers' },
            { text: 'Sales', icon: <Receipt />, path: '/admin/sales' },
            { text: 'Reports', icon: <BarChart />, path: '/admin/reports' },
        ] : []),
    ];

    const bottomItems = [
        { text: 'My Profile', icon: <Person />, path: '/admin/profile' },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const userInitial = user.first_name?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'A';
    const userName = user.first_name || user.name || 'Admin';
    const userRole = user.role === 'csr' ? 'CSR Agent' : user.role === 'admin' ? 'Administrator' : user.role || 'Staff';

    const DrawerContent = ({ collapsed }) => (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: SIDEBAR_BG,
                overflowX: 'hidden',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '5px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                },
            }}
        >
            {/* Logo / Brand */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: collapsed ? 1.5 : 3,
                    py: 2.5,
                    minHeight: 64,
                    gap: 1.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 4px 12px ${ACCENT}55`,
                    }}
                >
                    <Assignment sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                {!collapsed && (
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}
                        >
                            RMA Portal
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
                            Admin Console
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

            {/* User card */}
            {!collapsed && (
                <Box
                    sx={{
                        mx: 2,
                        my: 2,
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        {userInitial}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {userName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <Circle sx={{ fontSize: 6, color: '#4ade80' }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
                                {userRole}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            {collapsed && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        {userInitial}
                    </Avatar>
                </Box>
            )}

            {/* Nav label */}
            {!collapsed && (
                <Typography
                    variant="caption"
                    sx={{ px: 3, mb: 1, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, fontSize: 10, textTransform: 'uppercase' }}
                >
                    Navigation
                </Typography>
            )}

            {/* Main nav */}
            <List sx={{ px: 1, flex: 1 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setMobileOpen(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        px: collapsed ? 1.5 : 2,
                                        py: 1.1,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        minWidth: 0,
                                        position: 'relative',
                                        background: active
                                            ? `linear-gradient(90deg, ${ACCENT}22, ${ACCENT}11)`
                                            : 'transparent',
                                        border: active ? `1px solid ${ACCENT}44` : '1px solid transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: active
                                                ? `linear-gradient(90deg, ${ACCENT}33, ${ACCENT}22)`
                                                : 'rgba(255,255,255,0.05)',
                                            transform: 'translateX(2px)',
                                        },
                                        '&::before': active ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '20%',
                                            bottom: '20%',
                                            width: 3,
                                            borderRadius: 4,
                                            background: `linear-gradient(${ACCENT}, #8b5cf6)`,
                                        } : {},
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: collapsed ? 0 : 38,
                                            color: active ? ACCENT_LIGHT : 'rgba(255,255,255,0.4)',
                                            transition: 'color 0.2s',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: active ? 600 : 400,
                                                fontSize: 14,
                                                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom nav */}
            <Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, mb: 1 }} />
                {!collapsed && (
                    <Typography
                        variant="caption"
                        sx={{ px: 3, mb: 1, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, fontSize: 10, textTransform: 'uppercase', display: 'block' }}
                    >
                        Account
                    </Typography>
                )}
                <List sx={{ px: 1, pb: 2 }}>
                    {bottomItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                                    <ListItemButton
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobile) setMobileOpen(false);
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            px: collapsed ? 1.5 : 2,
                                            py: 1.1,
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            background: active ? `linear-gradient(90deg, ${ACCENT}22, ${ACCENT}11)` : 'transparent',
                                            border: active ? `1px solid ${ACCENT}44` : '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateX(2px)' },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: collapsed ? 0 : 38,
                                                color: active ? ACCENT_LIGHT : 'rgba(255,255,255,0.4)',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    fontWeight: active ? 600 : 400,
                                                    fontSize: 14,
                                                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                    {/* Logout */}
                    <ListItem disablePadding>
                        <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: 2,
                                    px: collapsed ? 1.5 : 2,
                                    py: 1.1,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: 'rgba(239,68,68,0.12)',
                                        '& .MuiListItemIcon-root': { color: '#f87171' },
                                        '& .MuiListItemText-primary': { color: '#f87171' },
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{ minWidth: collapsed ? 0 : 38, color: 'rgba(255,255,255,0.35)', justifyContent: 'center' }}
                                >
                                    <ExitToApp />
                                </ListItemIcon>
                                {!collapsed && (
                                    <ListItemText
                                        primary="Logout"
                                        primaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}
                                    />
                                )}
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );

    const currentWidth = isMobile ? 0 : (open ? drawerWidth : collapsedWidth);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            {/* Top AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: `calc(100% - ${currentWidth}px)`,
                    ml: `${currentWidth}px`,
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(16px)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    color: 'text.primary',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton
                        onClick={handleDrawerToggle}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'rgba(99,102,241,0.08)', color: ACCENT },
                        }}
                    >
                        {open && !isMobile ? <ChevronLeft /> : <MenuIcon />}
                    </IconButton>

                    {/* Breadcrumb / page title */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                            {menuItems.concat(bottomItems).find(i => isActive(i.path))?.text || 'Dashboard'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>

                    {/* Right actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={userRole}
                            size="small"
                            sx={{
                                background: `${ACCENT}18`,
                                color: ACCENT,
                                fontWeight: 600,
                                fontSize: 11,
                                display: { xs: 'none', sm: 'flex' },
                                border: `1px solid ${ACCENT}33`,
                            }}
                        />

                        <Tooltip title="Notifications">
                            <IconButton
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': { bgcolor: 'rgba(99,102,241,0.08)', color: ACCENT },
                                }}
                                onClick={() => navigate('/admin/notifications')}
                            >
                                <Badge badgeContent={0} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Account settings">
                            <IconButton onClick={handleMenu} sx={{ p: 0.5 }}>
                                <Avatar
                                    sx={{
                                        width: 34,
                                        height: 34,
                                        background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        border: `2px solid ${ACCENT}44`,
                                    }}
                                >
                                    {userInitial}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                elevation: 8,
                                sx: {
                                    mt: 1,
                                    minWidth: 200,
                                    borderRadius: 2,
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    overflow: 'hidden',
                                    '& .MuiMenuItem-root': {
                                        fontSize: 14,
                                        py: 1.2,
                                        px: 2,
                                        gap: 1.5,
                                        '&:hover': { bgcolor: `${ACCENT}0d` },
                                    },
                                },
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="subtitle2" fontWeight={700}>{userName}</Typography>
                                <Typography variant="caption" color="text.secondary">{user.email || userRole}</Typography>
                            </Box>
                            <MenuItem onClick={() => { navigate('/admin/profile'); handleClose(); }}>
                                <Person fontSize="small" sx={{ color: ACCENT }} />
                                My Profile
                            </MenuItem>
                            <MenuItem onClick={() => { navigate('/admin/settings'); handleClose(); }}>
                                <Settings fontSize="small" sx={{ color: 'text.secondary' }} />
                                Settings
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444 !important' }}>
                                <ExitToApp fontSize="small" sx={{ color: '#ef4444' }} />
                                Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Desktop Drawer */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    open={open}
                    sx={{
                        width: open ? drawerWidth : collapsedWidth,
                        flexShrink: 0,
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        '& .MuiDrawer-paper': {
                            width: open ? drawerWidth : collapsedWidth,
                            boxSizing: 'border-box',
                            border: 'none',
                            overflowX: 'hidden',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    <DrawerContent collapsed={!open} />
                </Drawer>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            border: 'none',
                        },
                    }}
                >
                    <DrawerContent collapsed={false} />
                </Drawer>
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: `calc(100% - ${currentWidth}px)`,
                    minHeight: '100vh',
                    bgcolor: '#f1f5f9',
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Toolbar />
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
