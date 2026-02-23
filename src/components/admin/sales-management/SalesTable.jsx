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
} from "@mui/material";
import {
    Edit,
    Delete,
    Receipt,
    Person,
    Inventory,
    CalendarMonth,
    Numbers,
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

    if (sales.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: "center" }}>
                <Receipt sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    No Sales Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filters, or add a new sale.
                </Typography>
            </Paper>
        );
    }

    const numSelected = selectedIds.length;
    const rowCount = sales.length;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                color="primary"
                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                checked={rowCount > 0 && numSelected === rowCount}
                                onChange={onSelectAll}
                            />
                        </TableCell>
                        <TableCell>Order #</TableCell>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="center">Sale Date</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sales.map((sale) => (
                        <TableRow
                            key={sale.id}
                            hover
                            onClick={() => onSelectRow(sale.id)}
                            role="checkbox"
                            aria-checked={selectedIds.includes(sale.id)}
                            selected={selectedIds.includes(sale.id)}
                            sx={{
                                "&:hover": { bgcolor: "action.hover" },
                                cursor: "pointer",
                            }}
                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={selectedIds.includes(sale.id)}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={() => onSelectRow(sale.id)}
                                />
                            </TableCell>

                            {/* Order Number */}
                            <TableCell>
                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: "bold", fontFamily: "monospace" }}
                                >
                                    {sale.orderNumber}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ID: {sale.id}
                                </Typography>
                            </TableCell>

                            {/* Invoice Number */}
                            <TableCell>
                                <Typography variant="body2">{sale.invoiceNumber || "N/A"}</Typography>
                            </TableCell>

                            {/* Customer */}
                            <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Person fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                            {sale.customerName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {sale.customerEmail}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>

                            {/* Product */}
                            <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Inventory fontSize="small" color="action" />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                            {sale.product?.name || "Unknown Product"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            SKU: {sale.product?.sku || "N/A"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>

                            {/* Quantity */}
                            <TableCell align="center">
                                <Chip
                                    label={sale.quantity}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: "bold" }}
                                />
                            </TableCell>

                            {/* Sale Date */}
                            <TableCell align="center">
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        justifyContent: "center",
                                    }}
                                >
                                    <CalendarMonth fontSize="small" color="action" />
                                    <Typography variant="body2">{formatDate(sale.saleDate)}</Typography>
                                </Box>
                            </TableCell>

                            {/* Actions */}
                            <TableCell align="right">
                                <Tooltip title="Edit Sale">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(sale);
                                        }}
                                        color="primary"
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete Sale">
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(sale.id);
                                        }}
                                        color="error"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SalesTable;
