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
  Box,
  Typography,
} from "@mui/material";
import {
  Visibility,
  Assignment,
  CheckCircle,
  Cancel,
  Warning,
  AccessTime,
  Error,
  Build,
  LocalShipping,
  DoneAll,
} from "@mui/icons-material";

const RMAList = ({ rmas, onViewDetails, onReview, userRole }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <AccessTime color="warning" />;
      case "under_review":
        return <Assignment color="info" />;
      case "approved":
        return <CheckCircle color="success" />;
      case "rejected":
        return <Cancel color="error" />;
      case "in_repair":
        return <Build color="action" />;
      case "shipped":
        return <LocalShipping color="primary" />;
      case "completed":
        return <DoneAll color="success" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { bg: "#FFF4E5", color: "#663C00", label: "Pending" },
      under_review: { bg: "#E5F6FD", color: "#014361", label: "Under Review" },
      approved: { bg: "#EDF7ED", color: "#1E4620", label: "Approved" },
      rejected: { bg: "#FDEDED", color: "#5F2120", label: "Rejected" },
      in_repair: { bg: "#F3E5F5", color: "#4A148C", label: "In Repair" },
      shipped: { bg: "#E3F2FD", color: "#0D47A1", label: "Shipped" },
      completed: { bg: "#E8F5E9", color: "#1B5E20", label: "Completed" },
    };

    const config = statusConfig[status] || { bg: "#EEEEEE", color: "#757575", label: status };

    return (
      <Chip
        icon={React.cloneElement(getStatusIcon(status), { style: { color: config.color, fontSize: '1.2rem' } })}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 700,
          fontSize: '0.75rem',
          borderRadius: 1.5,
          border: 'none',
          '& .MuiChip-icon': { ml: 1 }
        }}
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      high: { bg: "#FDEDED", color: "#D32F2F", label: "High" },
      medium: { bg: "#FFF4E5", color: "#ED6C02", label: "Medium" },
      low: { bg: "#EDF7ED", color: "#2E7D32", label: "Low" },
    };

    const config = priorityConfig[priority] || { bg: "#EEEEEE", color: "#757575", label: priority };

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 700,
          fontSize: '0.7rem',
          borderRadius: 1,
          textTransform: 'uppercase',
          height: 20
        }}
      />
    );
  };

  const getTypeChip = (type) => {
    const isReturn = type === "simple_return" || type === "return";
    const isWarranty = type === "warranty_repair" || type === "warranty";
    const label = isReturn ? "Simple Return" : (isWarranty ? "Warranty / Repair" : type);

    return (
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: isReturn ? "#E8EAF6" : "#F3E5F5",
          color: isReturn ? "#3F51B5" : "#9C27B0",
          fontWeight: 600,
          borderRadius: 1,
          fontSize: '0.75rem'
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const canReview = (rma) => {
    // Only allow review for pending or under_review RMAs
    const reviewAllowed = ["pending", "under_review"].includes(rma.status);

    // CSR can only review RMAs assigned to them or unassigned
    if (userRole === "csr") {
      return reviewAllowed;
    }

    // Admin and Super Admin can review all
    return reviewAllowed;
  };

  if (rmas.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No RMA requests found matching your filters.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, overflow: 'auto', border: '1px solid #edf2f7', maxWidth: '100%' }}>
      <Table size="small" sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: 700, color: "#64748b", py: 1.5, pl: 2 }}>RMA Info</TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#64748b", py: 1.5 }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#64748b", py: 1.5 }}>Status & Priority</TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#64748b", py: 1.5 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#64748b", py: 1.5 }}>Submitted</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: "#64748b", py: 1.5, pr: 2 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rmas.map((rma) => (
            <TableRow
              key={rma.id}
              hover
              sx={{
                cursor: "pointer",
                '&:hover': { backgroundColor: "#f1f5f9" },
                transition: 'background-color 0.2s'
              }}
              onClick={() => onViewDetails(rma)}
            >
              <TableCell sx={{ pl: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                  {rma.rmaNumber}
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rma.productName}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155", lineHeight: 1.2 }}>{rma.customerName}</Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", display: 'block' }}>
                  {rma.customerEmail}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                  {getStatusChip(rma.status)}
                  {getPriorityChip(rma.priority)}
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  {getTypeChip(rma.rmaType)}
                  {rma.requiresWarrantyCheck && (
                    <Tooltip title="Warranty validation required">
                      <Warning sx={{ fontSize: '0.9rem', color: "#f59e0b" }} />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: 'block' }}>
                  {rma.formattedDate}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ pr: 2, py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(rma);
                      }}
                      sx={{ color: "#64748b", p: 0.5, '&:hover': { color: "#1e293b", bgcolor: "#f1f5f9" } }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {canReview(rma) && (
                    <Tooltip title="Review RMA">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReview(rma);
                        }}
                        sx={{ color: "#2563eb", p: 0.5, ml: 0.5, '&:hover': { bgcolor: "#eff6ff" } }}
                      >
                        <Assignment fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RMAList;
