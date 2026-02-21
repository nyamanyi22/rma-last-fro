
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
  Switch,
  Checkbox,
  Box,
} from "@mui/material";
import {
  Edit,
  Delete,
  Inventory,
  LocalOffer,
  Category,
  BrandingWatermark,
  CalendarMonth,
} from "@mui/icons-material";

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  selectedIds = [],
  onSelectAll,
  onSelectRow
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getStockChip = (quantity) => {
    if (quantity === 0) {
      return <Chip label="Out of Stock" size="small" color="error" />;
    } else if (quantity < 10) {
      return <Chip label={`Low (${quantity})`} size="small" color="warning" />;
    } else {
      return <Chip label={`In Stock (${quantity})`} size="small" color="success" />;
    }
  };

  const getStatusChip = (isActive) => {
    return (
      <Chip
        label={isActive ? "Active" : "Inactive"}
        size="small"
        color={isActive ? "success" : "default"}
        variant="outlined"
      />
    );
  };

  if (products.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <Inventory sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Products Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search or filters, or add a new product.
        </Typography>
      </Paper>
    );
  }

  const numSelected = selectedIds.length;
  const rowCount = products.length;

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
                inputProps={{
                  'aria-label': 'select all desserts',
                }}
              />
            </TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="center">Warranty</TableCell>
            <TableCell align="center">Stock</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              hover
              onClick={() => onSelectRow(product.id)}
              role="checkbox"
              aria-checked={selectedIds.includes(product.id)}
              selected={selectedIds.includes(product.id)}
              sx={{
                "&:hover": { bgcolor: "action.hover" },
                cursor: 'pointer'
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedIds.includes(product.id)}
                  inputProps={{
                    'aria-labelledby': `enhanced-table-checkbox-${product.id}`,
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => onSelectRow(product.id)}
                />
              </TableCell>

              {/* SKU */}
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: "bold", fontFamily: "monospace" }}>
                  {product.sku}
                </Typography>
              </TableCell>

              {/* Product Name */}
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {product.id}
                </Typography>
              </TableCell>

              {/* Category */}
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Category fontSize="small" color="action" />
                  <Typography variant="body2">{product.category}</Typography>
                </Box>
              </TableCell>

              {/* Brand */}
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BrandingWatermark fontSize="small" color="action" />
                  <Typography variant="body2">{product.brand}</Typography>
                </Box>
              </TableCell>

              {/* Price */}
              <TableCell align="right">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                  <LocalOffer fontSize="small" color="primary" />
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {formatPrice(product.price)}
                  </Typography>
                </Box>
              </TableCell>

              {/* Warranty */}
              <TableCell align="center">
                <Chip
                  label={`${product.defaultWarrantyMonths} mo`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </TableCell>

              {/* Stock */}
              <TableCell align="center">
                {getStockChip(product.stockQuantity)}
              </TableCell>

              {/* Status */}
              <TableCell align="center">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <Switch
                    size="small"
                    checked={product.isActive}
                    onChange={() => onToggleStatus(product.id)}
                    color="success"
                  />
                  {getStatusChip(product.isActive)}
                </Box>
              </TableCell>

              {/* Actions */}
              <TableCell align="right">
                <Tooltip title="Edit Product">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(product)}
                    color="primary"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Product">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(product.id)}
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

export default ProductTable;
