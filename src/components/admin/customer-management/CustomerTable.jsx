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
    Typography
} from '@mui/material';
import {
    Visibility,
    Block,
    CheckCircle,
    MoreVert
} from '@mui/icons-material';

const CustomerTable = ({ customers, onViewDetails, onToggleStatus }) => {
    const getStatusChip = (status) => {
        const isBanned = status === 'banned';
        return (
            <Chip
                label={isBanned ? 'Banned' : 'Active'}
                color={isBanned ? 'error' : 'success'}
                size="small"
                variant={isBanned ? 'filled' : 'outlined'}
            />
        );
    };

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>User</TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Joined Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {customers.length > 0 ? (
                        customers.map((customer) => (
                            <TableRow key={customer.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            {customer.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {customer.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ID: {customer.id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{customer.email}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {customer.phone || 'No phone'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={customer.role || 'Customer'}
                                        size="small"
                                        sx={{ bgcolor: 'grey.100' }}
                                    />
                                </TableCell>
                                <TableCell>{getStatusChip(customer.status)}</TableCell>
                                <TableCell>{new Date(customer.joinedDate).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Details">
                                        <IconButton size="small" onClick={() => onViewDetails(customer)} color="info">
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={customer.status === 'banned' ? "Unban User" : "Ban User"}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onToggleStatus(customer.id)}
                                            color={customer.status === 'banned' ? "success" : "error"}
                                        >
                                            {customer.status === 'banned' ? <CheckCircle fontSize="small" /> : <Block fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No customers found matching your criteria.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default CustomerTable;
