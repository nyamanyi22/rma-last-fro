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
      pending: { color: "warning", label: "Pending" },
      under_review: { color: "info", label: "Under Review" },
      approved: { color: "success", label: "Approved" },
      rejected: { color: "error", label: "Rejected" },
      in_repair: { color: "secondary", label: "In Repair" },
      shipped: { color: "primary", label: "Shipped" },
      completed: { color: "success", label: "Completed" },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={config.label}
        size="small"
        color={config.color}
        variant="outlined"
      />
    );
  };

  const getPriorityChip = (priority) => {
    const priorityConfig = {
      high: { color: "error", label: "High" },
      medium: { color: "warning", label: "Medium" },
      low: { color: "success", label: "Low" },
    };

    const config = priorityConfig[priority] || { color: "default", label: priority };
    
    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        variant="outlined"
      />
    );
  };

  const getTypeChip = (type) => {
    return (
      <Chip
        label={type === "return" ? "Return" : "Warranty"}
        size="small"
        color={type === "return" ? "primary" : "secondary"}
        variant="outlined"
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
    <TableContainer>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>RMA Number</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Submitted</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rmas.map((rma) => (
            <TableRow
              key={rma.id}
              hover
              sx={{ cursor: "pointer" }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {rma.rmaNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{rma.customerName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {rma.customerEmail}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{rma.productName}</Typography>
              </TableCell>
              <TableCell>
                {getTypeChip(rma.rmaType)}
                {rma.requiresWarrantyCheck && (
                  <Tooltip title="Warranty validation required">
                    <Warning fontSize="small" color="warning" sx={{ ml: 0.5 }} />
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                {getStatusChip(rma.status)}
              </TableCell>
              <TableCell>
                {getPriorityChip(rma.priority)}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(rma.submittedDate)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(rma);
                    }}
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
                      color="primary"
                    >
                      <Assignment fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RMAList;
