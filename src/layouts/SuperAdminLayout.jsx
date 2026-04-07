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
    Badge,
    useTheme,
    useMediaQuery,
    Popover,
    CircularProgress,
    Button,
    ListItemAvatar,
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
    ChevronLeft,
    Receipt,
    Person,
    Notifications,
    Circle,
    AdminPanelSettings,
    Drafts,
    Email,
    MarkEmailRead,
    DeleteOutline,
    MoreVert,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import notificationService from '../services/api/notificationService';
import { usePortalSettings } from '../context/PortalSettingsContext';

const drawerWidth = 260;
const collapsedWidth = 72;

const SIDEBAR_BG = 'linear-gradient(180deg, #1a0533 0%, #2d1b69 100%)';
const ACCENT = '#a855f7';
const ACCENT_LIGHT = '#c084fc';

const SuperAdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [fetchingNotifications, setFetchingNotifications] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { portalName } = usePortalSettings();

    const handleDrawerToggle = () => {
        if (isMobile) setMobileOpen(!mobileOpen);
        else setOpen(!open);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to update unread count', error);
        }
    };

    React.useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleNotificationOpen = async (event) => {
        setNotificationAnchorEl(event.currentTarget);
        setFetchingNotifications(true);
        try {
            const response = await notificationService.getUnreadNotifications(5);
            setNotifications(response.notifications.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setFetchingNotifications(false);
        }
    };

    const handleNotificationClose = () => setNotificationAnchorEl(null);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/super-admin/dashboard' },
        { text: 'RMA Management', icon: <Assignment />, path: '/super-admin/rma' },
        { text: 'Products', icon: <Inventory />, path: '/super-admin/products' },
        { text: 'Customers', icon: <Group />, path: '/super-admin/customers' },
        { text: 'Sales', icon: <Receipt />, path: '/super-admin/sales' },
        { text: 'Staff Management', icon: <People />, path: '/super-admin/staff' },
        { text: 'Reports', icon: <BarChart />, path: '/super-admin/reports' },
        { text: 'Settings', icon: <Settings />, path: '/super-admin/settings' },
    ];

    const bottomItems = [
        { text: 'My Profile', icon: <Person />, path: '/super-admin/profile' },
        { text: 'Security', icon: <Security />, path: '/super-admin/security' },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    const userInitial = user.first_name?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || 'S';
    const userName = user.first_name || user.name || 'Super Admin';

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
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: collapsed ? 1.5 : 3, py: 2.5, minHeight: 64, gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${ACCENT}55` }}>
                    <AdminPanelSettings sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                {!collapsed && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}>{portalName}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Super Admin</Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2 }} />

            {/* Super Admin badge */}
            {!collapsed && (
                <Box sx={{ mx: 2, my: 2, p: 1.5, borderRadius: 2, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, fontSize: 14, fontWeight: 700 }}>{userInitial}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                            <Circle sx={{ fontSize: 6, color: '#4ade80' }} />
                            <Typography variant="caption" sx={{ color: ACCENT_LIGHT, fontSize: 10, fontWeight: 600 }}>Super Admin</Typography>
                        </Box>
                    </Box>
                </Box>
            )}
            {collapsed && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Avatar sx={{ width: 36, height: 36, background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, fontSize: 14, fontWeight: 700 }}>{userInitial}</Avatar>
                </Box>
            )}

            {!collapsed && (
                <Typography variant="caption" sx={{ px: 3, mb: 1, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, fontSize: 10, textTransform: 'uppercase' }}>
                    Navigation
                </Typography>
            )}

            <List sx={{ px: 1, flex: 1 }}>
                {menuItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                                <ListItemButton
                                    onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                                    sx={{
                                        borderRadius: 2, px: collapsed ? 1.5 : 2, py: 1.1,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        position: 'relative',
                                        background: active ? `linear-gradient(90deg, ${ACCENT}22, ${ACCENT}11)` : 'transparent',
                                        border: active ? `1px solid ${ACCENT}44` : '1px solid transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { background: active ? `linear-gradient(90deg, ${ACCENT}33, ${ACCENT}22)` : 'rgba(255,255,255,0.05)', transform: 'translateX(2px)' },
                                        '&::before': active ? { content: '""', position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 4, background: `linear-gradient(${ACCENT}, #7c3aed)` } : {},
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: active ? ACCENT_LIGHT : 'rgba(255,255,255,0.4)', transition: 'color 0.2s', justifyContent: 'center' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: 14, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            <Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mx: 2, mb: 1 }} />
                {!collapsed && (
                    <Typography variant="caption" sx={{ px: 3, mb: 1, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1, fontSize: 10, textTransform: 'uppercase', display: 'block' }}>
                        System
                    </Typography>
                )}
                <List sx={{ px: 1, pb: 2 }}>
                    {bottomItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                                    <ListItemButton
                                        onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                                        sx={{
                                            borderRadius: 2, px: collapsed ? 1.5 : 2, py: 1.1, justifyContent: collapsed ? 'center' : 'flex-start',
                                            background: active ? `linear-gradient(90deg, ${ACCENT}22, ${ACCENT}11)` : 'transparent',
                                            border: active ? `1px solid ${ACCENT}44` : '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateX(2px)' },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: active ? ACCENT_LIGHT : 'rgba(255,255,255,0.4)', justifyContent: 'center' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: 14, color: active ? '#fff' : 'rgba(255,255,255,0.6)' }} />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                    <ListItem disablePadding>
                        <Tooltip title={collapsed ? 'Logout' : ''} placement="right" arrow>
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: 2, px: collapsed ? 1.5 : 2, py: 1.1, justifyContent: collapsed ? 'center' : 'flex-start',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { background: 'rgba(239,68,68,0.12)', '& .MuiListItemIcon-root': { color: '#f87171' }, '& .MuiListItemText-primary': { color: '#f87171' } },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: 'rgba(255,255,255,0.35)', justifyContent: 'center' }}>
                                    <ExitToApp />
                                </ListItemIcon>
                                {!collapsed && <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />}
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
                    transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.secondary', '&:hover': { bgcolor: `${ACCENT}12`, color: ACCENT } }}>
                        {open && !isMobile ? <ChevronLeft /> : <MenuIcon />}
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                            {menuItems.concat(bottomItems).find(i => isActive(i.path))?.text || 'Dashboard'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="Super Admin" size="small" sx={{ bgcolor: `${ACCENT}18`, color: ACCENT, fontWeight: 600, fontSize: 11, display: { xs: 'none', sm: 'flex' }, border: `1px solid ${ACCENT}33` }} />
                        <Tooltip title="Notifications">
                            <IconButton 
                                sx={{ color: 'text.secondary', '&:hover': { bgcolor: `${ACCENT}12`, color: ACCENT } }}
                                onClick={handleNotificationOpen}
                            >
                                <Badge badgeContent={unreadCount} color="error" max={99}>
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Notifications Dropdown */}
                        <Popover
                            open={Boolean(notificationAnchorEl)}
                            anchorEl={notificationAnchorEl}
                            onClose={handleNotificationClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                elevation: 8,
                                sx: {
                                    mt: 1.5,
                                    width: 360,
                                    maxWidth: '90vw',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                },
                            }}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                                {unreadCount > 0 && (
                                    <Button size="small" onClick={markAllRead} sx={{ fontSize: 12, textTransform: 'none', fontWeight: 600, color: ACCENT }}>
                                        Mark all read
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                                {fetchingNotifications ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <CircularProgress size={24} sx={{ color: ACCENT }} />
                                    </Box>
                                ) : notifications.length === 0 ? (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Drafts sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                                        <Typography variant="body2" color="text.secondary">No unread notifications</Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {notifications.map((notif) => (
                                            <ListItem 
                                                key={notif.id} 
                                                disablePadding 
                                                sx={{ 
                                                    borderBottom: '1px solid rgba(0,0,0,0.03)',
                                                    '&:hover': { bgcolor: 'rgba(168, 85, 247, 0.04)' }
                                                }}
                                            >
                                                <ListItemButton 
                                                    onClick={() => {
                                                        markAsRead(notif.id);
                                                        // Determine correct route for super admin
                                                        const url = notif.data.action_url ? notif.data.action_url.replace('/admin/', '/super-admin/') : '/super-admin/rma';
                                                        navigate(url);
                                                        handleNotificationClose();
                                                    }}
                                                    sx={{ py: 1.5, px: 2, alignItems: 'flex-start' }}
                                                >
                                                    <ListItemAvatar sx={{ minWidth: 48 }}>
                                                        <Avatar sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, width: 36, height: 36 }}>
                                                            {notif.data.type === 'new_rma' ? <Assignment fontSize="small" /> : notif.data.type === 'internal_note' ? <Email fontSize="small" /> : <BarChart fontSize="small" />}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: 13, color: '#334155', lineHeight: 1.3 }}>
                                                            {notif.data.title}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                            {notif.data.message}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', fontSize: 10 }}>
                                                            {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </Typography>
                                                    </Box>
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </Box>

                            <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                <Button 
                                    fullWidth 
                                    onClick={() => { navigate('/super-admin/notifications'); handleNotificationClose(); }}
                                    sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', '&:hover': { color: ACCENT } }}
                                >
                                    View all notifications
                                </Button>
                            </Box>
                        </Popover>
                        <Tooltip title="Account">
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                                <Avatar sx={{ width: 34, height: 34, background: `linear-gradient(135deg, ${ACCENT}, #7c3aed)`, fontSize: 13, fontWeight: 700, border: `2px solid ${ACCENT}44` }}>{userInitial}</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{ elevation: 8, sx: { mt: 1, minWidth: 200, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', '& .MuiMenuItem-root': { fontSize: 14, py: 1.2, px: 2, gap: 1.5, '&:hover': { bgcolor: `${ACCENT}0d` } } } }}
                        >
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="subtitle2" fontWeight={700}>{userName}</Typography>
                                <Typography variant="caption" color="text.secondary">{user.email || 'Super Admin'}</Typography>
                            </Box>
                            <MenuItem onClick={() => { navigate('/super-admin/profile'); setAnchorEl(null); }}>
                                <Person fontSize="small" sx={{ color: ACCENT }} /> My Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: '#ef4444 !important' }}>
                                <ExitToApp fontSize="small" sx={{ color: '#ef4444' }} /> Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: open ? drawerWidth : collapsedWidth,
                        flexShrink: 0,
                        transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
                        '& .MuiDrawer-paper': { width: open ? drawerWidth : collapsedWidth, boxSizing: 'border-box', border: 'none', overflowX: 'hidden', transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) },
                    }}
                >
                    <DrawerContent collapsed={!open} />
                </Drawer>
            )}
            {isMobile && (
                <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' } }}>
                    <DrawerContent collapsed={false} />
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: `calc(100% - ${currentWidth}px)`,
                    minHeight: '100vh',
                    bgcolor: '#f1f5f9',
                    transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
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

export default SuperAdminLayout;
