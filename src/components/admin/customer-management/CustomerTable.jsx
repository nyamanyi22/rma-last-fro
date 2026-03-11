import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Avatar,
    Box,
    Typography,
    Checkbox,
    Switch,
    Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    VisibilityOutlined,
    EditOutlined,
    DeleteOutline,
    EmailOutlined,
    LocalPhoneOutlined,
    LocationOnOutlined,
} from '@mui/icons-material';

const AVATAR_COLORS = [
    '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
    '#0288d1', '#7b1fa2', '#388e3c', '#f57c00', '#455a64'
];

const CustomerTable = ({
    customers,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
    selectedIds = [],
    onSelectAll,
    onSelectRow
}) => {
    const getInitials = (customer) => {
        const firstName = customer.first_name || customer.firstName || '';
        const lastName = customer.last_name || customer.lastName || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
    };

    const getFullName = (customer) => {
        const firstName = customer.first_name || customer.firstName || '';
        const lastName = customer.last_name || customer.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'No Name';
    };

    const getColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (customers.length === 0) {
        return (
            <Box sx={{ p: 8, textAlign: 'center', bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    No Customers Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Your search didn't return any results. Try adjusting your filters.
                </Typography>
            </Box>
        );
    }

    const numSelected = selectedIds.length;
    const rowCount = customers.length;

    return (
        <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1000, borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-head': { borderBottom: 'none', px: 2, pb: 1, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' } }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                checked={rowCount > 0 && numSelected === rowCount}
                                onChange={onSelectAll}
                                sx={{ p: 0.5 }}
                            />
                        </TableCell>
                        <TableCell>Identity</TableCell>
                        <TableCell>Contact Channel</TableCell>
                        <TableCell>Geographics</TableCell>
                        <TableCell>Member Since</TableCell>
                        <TableCell align="center">Account Status</TableCell>
                        <TableCell align="right">Operations</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {customers.map((customer) => {
                        const isSelected = selectedIds.includes(customer.id);
                        const avatarColor = getColor(customer.id);

                        return (
                            <TableRow
                                key={customer.id}
                                hover
                                onClick={() => onSelectRow(customer.id)}
                                role="checkbox"
                                aria-checked={isSelected}
                                selected={isSelected}
                                sx={{
                                    bgcolor: 'background.paper',
                                    '&.Mui-selected': { bgcolor: alpha('#1976d2', 0.04) },
                                    '&:hover': { bgcolor: alpha('#f8f9fa', 0.8), transform: 'scale(1.002)', transition: 'all 0.2s ease' },
                                    '& td': { borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', py: 2 },
                                    '& td:first-of-type': { borderLeft: '1px solid', borderColor: 'divider', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, pl: 2 },
                                    '& td:last-of-type': { borderRight: '1px solid', borderColor: 'divider', borderTopRightRadius: 12, borderBottomRightRadius: 12, pr: 2 },
                                    mb: 1,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                    cursor: 'pointer'
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isSelected}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => onSelectRow(customer.id)}
                                        sx={{ p: 0.5 }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                bgcolor: alpha(avatarColor, 0.1),
                                                color: avatarColor,
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                border: '1px solid',
                                                borderColor: alpha(avatarColor, 0.2)
                                            }}
                                        >
                                            {getInitials(customer)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                                {getFullName(customer)}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontWeight: 600 }}>
                                                USR-{customer.id}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailOutlined fontSize="inherit" sx={{ color: 'text.disabled' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{customer.email}</Typography>
                                        </Box>
                                        {customer.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocalPhoneOutlined fontSize="inherit" sx={{ color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.secondary">{customer.phone}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationOnOutlined fontSize="inherit" sx={{ color: 'text.disabled' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer.city || 'Global'}</Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ pl: 2.5 }}>
                                            {customer.country || 'Distributed'}
                                        </Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {formatDate(customer.created_at || customer.createdAt)}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center">
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                        <Switch
                                            size="small"
                                            checked={!!customer.is_active}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onToggleStatus(customer.id);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <Chip
                                            label={customer.is_active ? 'Active' : 'Locked'}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                bgcolor: customer.is_active ? alpha('#2e7d32', 0.1) : alpha('#9e9e9e', 0.1),
                                                color: customer.is_active ? '#2e7d32' : '#757575',
                                            }}
                                        />
                                    </Stack>
                                </TableCell>

                                <TableCell align="right">
                                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                        <Tooltip title="View Profile">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); onView(customer); }}
                                                sx={{ bgcolor: alpha('#1976d2', 0.05), color: '#1976d2', '&:hover': { bgcolor: alpha('#1976d2', 0.1) } }}
                                            >
                                                <VisibilityOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Member">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); onEdit(customer); }}
                                                sx={{ bgcolor: alpha('#7b1fa2', 0.05), color: '#7b1fa2', '&:hover': { bgcolor: alpha('#7b1fa2', 0.1) } }}
                                            >
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Soft Delete">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }}
                                                sx={{ bgcolor: alpha('#d32f2f', 0.05), color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.1) } }}
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CustomerTable;