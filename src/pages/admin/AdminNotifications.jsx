import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    Avatar,
    ListItemText,
    IconButton,
    Button,
    Chip,
    Divider,
    CircularProgress,
    Tooltip,
    Pagination,
    Menu,
    MenuItem,
    Alert,
} from '@mui/material';
import {
    Assignment,
    Email,
    BarChart,
    DeleteOutline,
    DoneAll,
    MoreVert,
    NotificationsOff,
    CheckCircle,
    Info,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/api/notificationService';

const AdminNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedNotif, setSelectedNotif] = useState(null);

    const ACCENT = '#6366f1';

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationService.getAllNotifications(page);
            setNotifications(response.notifications.data || []);
            setTotalPages(response.notifications.last_page || 1);
            
            // Also fetch current unread count
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            if (notifications.find(n => n.id === id && !n.read_at)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification', error);
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            try {
                await notificationService.clearAll();
                setNotifications([]);
                setUnreadCount(0);
            } catch (error) {
                console.error('Error clearing all notifications', error);
            }
        }
    };

    const handleMenuOpen = (event, notif) => {
        setAnchorEl(event.currentTarget);
        setSelectedNotif(notif);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotif(null);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'new_rma': return <Assignment />;
            case 'internal_note': return <Email />;
            case 'status_update': return <CheckCircle />;
            default: return <Info />;
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'new_rma': return '#6366f1';
            case 'internal_note': return '#f59e0b';
            case 'status_update': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-1px' }}>
                        Notifications Center
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your alerts and stay updated with RMA activities
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {unreadCount > 0 && (
                        <Button
                            variant="outlined"
                            startIcon={<DoneAll />}
                            onClick={handleMarkAllRead}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Mark All Read
                        </Button>
                    )}
                    <Button
                        variant="soft"
                        color="error"
                        startIcon={<DeleteOutline />}
                        onClick={handleClearAll}
                        sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontWeight: 600,
                            bgcolor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                        }}
                    >
                        Clear All
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}>
                {loading && page === 1 ? (
                    <Box sx={{ py: 10, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: ACCENT }} />
                        <Typography sx={{ mt: 2 }} color="text.secondary">Loading notifications...</Typography>
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ py: 12, textAlign: 'center' }}>
                        <NotificationsOff sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                        <Typography variant="h6" fontWeight={700} color="text.secondary">No notifications yet</Typography>
                        <Typography variant="body2" color="text.disabled">We'll alert you when there's activity on your RMAs</Typography>
                    </Box>
                ) : (
                    <>
                        <List sx={{ p: 0 }}>
                            {notifications.map((notif, index) => {
                                const isUnread = !notif.read_at;
                                const data = notif.data || {};
                                
                                return (
                                    <React.Fragment key={notif.id}>
                                        <ListItem
                                            disablePadding
                                            secondaryAction={
                                                <IconButton edge="end" onClick={(e) => handleMenuOpen(e, notif)}>
                                                    <MoreVert />
                                                </IconButton>
                                            }
                                            sx={{
                                                bgcolor: isUnread ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                                '&::before': isUnread ? {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: 0,
                                                    bottom: 0,
                                                    width: 4,
                                                    bgcolor: ACCENT
                                                } : {}
                                            }}
                                        >
                                            <ListItemButton 
                                                onClick={() => {
                                                    if (isUnread) handleMarkAsRead(notif.id);
                                                    navigate(data.action_url || '/admin/rma');
                                                }}
                                                sx={{ py: 3, px: 4 }}
                                            >
                                                <ListItemAvatar sx={{ minWidth: 64 }}>
                                                    <Avatar sx={{ bgcolor: `${getIconColor(data.type)}15`, color: getIconColor(data.type), width: 44, height: 44 }}>
                                                        {getIcon(data.type)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Box sx={{ flex: 1, pr: 4 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                                        <Typography variant="subtitle1" fontWeight={700} color={isUnread ? '#0f172a' : 'text.secondary'}>
                                                            {data.title}
                                                        </Typography>
                                                        {isUnread && (
                                                            <Chip label="New" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 800, bgcolor: ACCENT, color: '#fff' }} />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" color={isUnread ? 'text.primary' : 'text.secondary'} sx={{ lineHeight: 1.5 }}>
                                                        {data.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                                        {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Authorized by {data.created_by_name || 'System'}
                                                    </Typography>
                                                </Box>
                                            </ListItemButton>
                                        </ListItem>
                                        {index < notifications.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                        
                        {totalPages > 1 && (
                            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: '#f8fafc' }}>
                                <Pagination 
                                    count={totalPages} 
                                    page={page} 
                                    onChange={(e, v) => setPage(v)} 
                                    color="primary"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 160, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' } }}
            >
                {selectedNotif && !selectedNotif.read_at && (
                    <MenuItem onClick={() => { handleMarkAsRead(selectedNotif.id); handleMenuClose(); }}>
                        <CheckCircle sx={{ fontSize: 18, mr: 1.5, color: ACCENT }} />
                        Mark as read
                    </MenuItem>
                )}
                <MenuItem onClick={() => { handleDeleteNotification(selectedNotif.id); handleMenuClose(); }} sx={{ color: '#ef4444' }}>
                    <DeleteOutline sx={{ fontSize: 18, mr: 1.5 }} />
                    Delete
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default AdminNotifications;
