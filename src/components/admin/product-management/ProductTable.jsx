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
  Avatar,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Edit,
  Delete,
  Inventory2Outlined,
  LaptopMac,
  DesktopWindows,
  Monitor,
  Mouse,
  Print,
  Dns,
  Router,
  Storage,
  QuestionMark,
} from "@mui/icons-material";

const CATEGORY_ICONS = {
  Laptop: { icon: LaptopMac, color: '#1976d2' },
  Desktop: { icon: DesktopWindows, color: '#7b1fa2' },
  Monitor: { icon: Monitor, color: '#0288d1' },
  Accessory: { icon: Mouse, color: '#689f38' },
  Printer: { icon: Print, color: '#f57c00' },
  Server: { icon: Dns, color: '#d32f2f' },
  Networking: { icon: Router, color: '#455a64' },
  Storage: { icon: Storage, color: '#388e3c' },
  Other: { icon: QuestionMark, color: '#9e9e9e' },
};

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

  if (products.length === 0) {
    return (
      <Box sx={{ p: 8, textAlign: "center", bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
        <Inventory2Outlined sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Your catalog is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Add your first product to see it listed here.
        </Typography>
      </Box>
    );
  }

  const numSelected = selectedIds.length;
  const rowCount = products.length;

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
            <TableCell>Product Information</TableCell>
            <TableCell>Details</TableCell>
            <TableCell align="right">Pricing</TableCell>
            <TableCell align="center">Inventory</TableCell>
            <TableCell align="center">Visibility</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => {
            const categoryData = CATEGORY_ICONS[product.category] || CATEGORY_ICONS.Other;
            const CategoryIcon = categoryData.icon;
            const isSelected = selectedIds.includes(product.id);

            return (
              <TableRow
                key={product.id}
                hover
                onClick={() => onSelectRow(product.id)}
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
                {/* Checkbox */}
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => onSelectRow(product.id)}
                    sx={{ p: 0.5 }}
                  />
                </TableCell>

                {/* Info */}
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: alpha(categoryData.color, 0.1),
                        color: categoryData.color,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: alpha(categoryData.color, 0.2)
                      }}
                    >
                      <CategoryIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
                        {product.sku}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                {/* Details */}
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'divider' }} />
                      {product.brand}
                    </Typography>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        width: 'fit-content',
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        bgcolor: alpha(categoryData.color, 0.08),
                        color: categoryData.color,
                        border: '1px solid',
                        borderColor: alpha(categoryData.color, 0.15)
                      }}
                    />
                  </Stack>
                </TableCell>

                {/* Price */}
                <TableCell align="right">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                    {formatPrice(product.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.defaultWarrantyMonths} mo warranty
                  </Typography>
                </TableCell>

                {/* Stock */}
                <TableCell align="center">
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: product.stockQuantity === 0 ? 'error.main' : (product.stockQuantity < 10 ? 'warning.main' : 'success.main')
                      }}
                    >
                      {product.stockQuantity} in stock
                    </Typography>
                    <Box sx={{ width: 40, height: 4, bgcolor: 'grey.100', borderRadius: 2, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${Math.min(product.stockQuantity, 100)}%`,
                          height: '100%',
                          bgcolor: product.stockQuantity === 0 ? 'error.main' : (product.stockQuantity < 10 ? 'warning.main' : 'success.main')
                        }}
                      />
                    </Box>
                  </Stack>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <Switch
                      size="small"
                      checked={product.isActive}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleStatus(product.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Chip
                      label={product.isActive ? "Live" : "Hidden"}
                      size="small"
                      variant="filled"
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: product.isActive ? alpha('#2e7d32', 0.1) : alpha('#9e9e9e', 0.1),
                        color: product.isActive ? '#2e7d32' : '#757575',
                      }}
                    />
                  </Stack>
                </TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                        sx={{ bgcolor: alpha('#1976d2', 0.05), color: '#1976d2', '&:hover': { bgcolor: alpha('#1976d2', 0.1) } }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                        sx={{ bgcolor: alpha('#d32f2f', 0.05), color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.1) } }}
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

export default ProductTable;
