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
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    People,
    Settings,
    Security,
    BarChart,
    Assignment,
    Inventory,
    Group,
    ExitToApp,
    ChevronLeft
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;

const SuperAdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/super-admin/dashboard' },
        { text: 'Staff Management', icon: <People />, path: '/super-admin/staff' },
        { text: 'RMA Management', icon: <Assignment />, path: '/super-admin/rma' },
        { text: 'Product Management', icon: <Inventory />, path: '/super-admin/products' },
        { text: 'Customer Management', icon: <Group />, path: '/super-admin/customers' },
        { text: 'Security', icon: <Security />, path: '/super-admin/security' },
        { text: 'Settings', icon: <Settings />, path: '/super-admin/settings' },
        { text: 'Reports', icon: <BarChart />, path: '/super-admin/reports' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    color: 'text.primary'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        Super Admin Portal
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user.name || 'Admin'}
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                {user.name ? user.name[0].toUpperCase() : 'A'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <ExitToApp fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "persistent"}
                open={open}
                onClose={isMobile ? handleDrawerToggle : undefined}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid rgba(0,0,0,0.05)',
                        background: '#fff'
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1, px: 1 }}>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'white',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500 }} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, transition: 'all 0.3s' }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default SuperAdminLayout;
