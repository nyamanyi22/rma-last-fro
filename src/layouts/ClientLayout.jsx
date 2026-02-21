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
    useMediaQuery,
    Button
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Assignment,
    History,
    Person,
    ExitToApp,
    Add
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;

const ClientLayout = () => {
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
        { text: 'Dashboard', icon: <Dashboard />, path: '/client/dashboard' },

        { text: 'My RMAs', icon: <History />, path: '/client/rma/history' },
        { text: 'My Profile', icon: <Person />, path: '/client/profile' },
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
                        Customer Portal
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Welcome, {user.first_name || user.name || 'Customer'}
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                                {user.first_name ? user.first_name[0].toUpperCase() : (user.name ? user.name[0].toUpperCase() : 'C')}
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
                            <MenuItem onClick={() => { navigate('/client/profile'); handleClose(); }}>
                                <ListItemIcon>
                                    <Person fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <Divider />
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
                <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Add />}
                            onClick={() => navigate('/client/rma/new')}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
                            }}
                        >
                            New Request
                        </Button>
                    </Box>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.light',
                                            color: 'primary.main',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                bgcolor: 'primary',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.main',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400 }} />
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

export default ClientLayout;
