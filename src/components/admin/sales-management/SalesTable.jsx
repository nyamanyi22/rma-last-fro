import React from "react";
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
    Typography,
    Checkbox,
    Box,
    Avatar,
    Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    Edit,
    Delete,
    ReceiptOutlined,
    PersonOutlined,
    Inventory2Outlined,
    CalendarMonthOutlined,
    VerifiedOutlined,
    NewReleasesOutlined,
    HelpOutline,
} from "@mui/icons-material";

const SalesTable = ({
    sales,
    onEdit,
    onDelete,
    selectedIds = [],
    onSelectAll,
    onSelectRow,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (sales.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 8,
                    textAlign: "center",
                    borderRadius: 4,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: alpha('#f5f5f5', 0.5)
                }}
            >
                <ReceiptOutlined sx={{ fontSize: 64, color: "text.disabled", mb: 2, opacity: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Empty Sales Ledger
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    We couldn't find any transaction records. Start by adding a new sale or importing a CSV.
                </Typography>
            </Paper>
        );
    }

    const numSelected = selectedIds.length;
    const rowCount = sales.length;

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
            }}
        >
            <Table sx={{ minWidth: 800 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: alpha('#f5f5f5', 0.8) }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                checked={rowCount > 0 && numSelected === rowCount}
                                onChange={onSelectAll}
                                sx={{ color: 'text.secondary' }}
                            />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Invoice Details
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Customer Entity
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Product Logistics
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Quantity
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>
                            Warranty Scope
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, pr: 4 }}>
                            Actions
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sales.map((sale) => {
                        const isSelected = selectedIds.includes(sale.id);
                        return (
                            <TableRow
                                key={sale.id}
                                hover
                                onClick={() => onSelectRow(sale.id)}
                                role="checkbox"
                                aria-checked={isSelected}
                                selected={isSelected}
                                sx={{
                                    cursor: "pointer",
                                    transition: 'all 0.2s',
                                    '&.Mui-selected': {
                                        bgcolor: alpha('#1976d2', 0.04),
                                        '&:hover': { bgcolor: alpha('#1976d2', 0.08) }
                                    }
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={isSelected}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={() => onSelectRow(sale.id)}
                                    />
                                </TableCell>

                                {/* Invoice Details */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: alpha('#1976d2', 0.1), color: '#1976d2', width: 40, height: 40 }}>
                                            <ReceiptOutlined fontSize="small" />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                                #{sale.invoiceNumber || "N/A"}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarMonthOutlined sx={{ fontSize: 12 }} />
                                                {formatDate(sale.saleDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Customer Entity */}
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                bgcolor: `hsl(${(sale.customerName?.length * 137) % 360}, 60%, 50%)`
                                            }}
                                        >
                                            {getInitials(sale.customerName)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {sale.customerName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {sale.customerEmail}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Product Logistics */}
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#f5f5f5', 0.8) }}>
                                            <Inventory2Outlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {sale.product?.name || "Standard Product"}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                SKU: {sale.product?.sku || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Quantity */}
                                <TableCell align="center">
                                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary' }}>
                                        {sale.quantity}x
                                    </Typography>
                                </TableCell>

                                {/* Warranty Scope */}
                                <TableCell align="center">
                                    <Chip
                                        icon={sale.warrantyStatus === 'Active' ? <VerifiedOutlined /> : <NewReleasesOutlined />}
                                        label={sale.warrantyStatus || 'No Coverage'}
                                        size="small"
                                        sx={{
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            px: 1,
                                            bgcolor: sale.warrantyStatus === 'Active'
                                                ? alpha('#2e7d32', 0.1)
                                                : sale.warrantyStatus === 'Expired'
                                                    ? alpha('#d32f2f', 0.1)
                                                    : alpha('#757575', 0.1),
                                            color: sale.warrantyStatus === 'Active'
                                                ? '#2e7d32'
                                                : sale.warrantyStatus === 'Expired'
                                                    ? '#d32f2f'
                                                    : '#757575',
                                            '& .MuiChip-icon': { color: 'inherit' }
                                        }}
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="right" sx={{ pr: 2 }}>
                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                        <Tooltip title="Modify Record">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(sale);
                                                }}
                                                sx={{
                                                    color: 'primary.main',
                                                    '&:hover': { bgcolor: alpha('#1976d2', 0.1) }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remove Record">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(sale.id);
                                                }}
                                                sx={{
                                                    color: 'error.main',
                                                    '&:hover': { bgcolor: alpha('#d32f2f', 0.1) }
                                                }}
                                            >
                                                <Delete fontSize="small" />
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

export default SalesTable;
