import React from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment
} from '@mui/material';
import { Visibility, Search, FilterList } from '@mui/icons-material';

const ClientRMAHistory = () => {
    // Mock data
    const rmas = [
        { id: 'RMA-2024-001', product: 'Dell XPS 13', type: 'Warranty', status: 'Pending', date: '2024-02-10' },
        { id: 'RMA-2024-002', product: 'Logitech MX Master', type: 'Return', status: 'Approved', date: '2024-02-08' },
        { id: 'RMA-2024-003', product: 'Samsung Monitor', type: 'Repair', status: 'In Repair', date: '2024-02-01' },
        { id: 'RMA-2024-004', product: 'iPhone 15 Case', type: 'Return', status: 'Rejected', date: '2024-01-25' },
    ];

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'success';
        if (status === 'Pending') color = 'warning';
        if (status === 'In Repair') color = 'info';
        if (status === 'Rejected') color = 'error';

        return <Chip label={status} color={color} size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />;
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                My RMA History
            </Typography>

            <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="Search by RMA ID or Product"
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
                    }}
                    sx={{ maxWidth: 400 }}
                />
                <IconButton>
                    <FilterList />
                </IconButton>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell sx={{ fontWeight: 600 }}>RMA ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date Submitted</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rmas.map((rma) => (
                            <TableRow key={rma.id} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{rma.id}</TableCell>
                                <TableCell>{rma.product}</TableCell>
                                <TableCell>{rma.type}</TableCell>
                                <TableCell>{rma.date}</TableCell>
                                <TableCell>{getStatusChip(rma.status)}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary">
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ClientRMAHistory;
