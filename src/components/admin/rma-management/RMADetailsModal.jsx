import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close,
  Download,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Receipt,
  Build,
  LocalShipping,
  CheckCircle,
  Cancel,
  Comment,
  History,
} from "@mui/icons-material";

const RMADetailsModal = ({ open, onClose, rma, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [comment, setComment] = useState("");

  if (!rma) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddComment = () => {
    if (comment.trim()) {
      // In real app, save comment to API
      alert(`Comment added: ${comment}`);
      setComment("");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      under_review: "info",
      approved: "success",
      rejected: "error",
      in_repair: "secondary",
      shipped: "primary",
      completed: "success",
    };
    return colors[status] || "default";
  };

  const getTypeLabel = (type) => {
    return type === "return" ? "Simple Return" : "Warranty/Repair Claim";
  };

  const getReasonLabel = (reason) => {
    const reasons = {
      shipping_damage: "Shipping Damage",
      wrong_item: "Wrong Item Received",
      defective_on_arrival: "Defective on Arrival",
      customer_return: "Customer Return",
      product_failure: "Product Failure",
      hardware_defect: "Hardware Defect",
      software_issue: "Software Issue",
      physical_damage: "Physical Damage",
      performance_issue: "Performance Issue",
    };
    return reasons[reason] || reason;
  };

  // Mock data for attachments
  const attachments = [
    { id: 1, name: "receipt.pdf", type: "pdf", size: "1.2 MB" },
    { id: 2, name: "damage_photo1.jpg", type: "image", size: "2.5 MB" },
    { id: 3, name: "damage_photo2.jpg", type: "image", size: "3.1 MB" },
  ];

  // Mock status history
  const statusHistory = [
    { date: "2024-01-15 10:30", status: "pending", user: "System", notes: "RMA submitted by customer" },
    { date: "2024-01-15 14:45", status: "under_review", user: "Admin User", notes: "Assigned for review" },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">
            RMA Details: {rma.rmaNumber}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Header with quick actions */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Status</Typography>
              <Chip
                label={rma.status.toUpperCase()}
                color={getStatusColor(rma.status)}
                size="small"
                sx={{ fontWeight: "bold" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">RMA Type</Typography>
              <Typography variant="body1">{getTypeLabel(rma.rmaType)}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2">Priority</Typography>
              <Chip
                label={rma.priority.toUpperCase()}
                color={rma.priority === "high" ? "error" : rma.priority === "medium" ? "warning" : "success"}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Attachments" />
            <Tab label="Status History" />
            <Tab label="Warranty Info" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Customer Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                  Customer Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>Name:</TableCell>
                        <TableCell sx={{ border: "none" }}>{rma.customerName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>
                          <Email fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
                          Email:
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>{rma.customerEmail}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>Phone:</TableCell>
                        <TableCell sx={{ border: "none" }}>+1 (555) 123-4567</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>
                          <LocationOn fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
                          Address:
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>
                          123 Main St, Anytown, USA 12345
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Product Info */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                  Product Information
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>Product:</TableCell>
                        <TableCell sx={{ border: "none" }}>{rma.productName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>Serial Number:</TableCell>
                        <TableCell sx={{ border: "none" }}>SN-1234567890</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>
                          <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
                          Purchase Date:
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>2024-01-01</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold", border: "none" }}>
                          <Receipt fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
                          Receipt No:
                        </TableCell>
                        <TableCell sx={{ border: "none" }}>INV-2024-00123</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Issue Details */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
                  Issue Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Reason:</strong> {getReasonLabel(rma.reason)}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2"><strong>Submitted:</strong> {rma.submittedDate}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2"><strong>Description:</strong></Typography>
                    <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                      The product stopped working after 2 weeks of use. The screen flickers and the device overheats. Tried resetting but issue persists.
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Attached Files ({attachments.length})
            </Typography>
            <Grid container spacing={2}>
              {attachments.map((file) => (
                <Grid item xs={12} sm={6} md={4} key={file.id}>
                  <Paper sx={{ p: 2, display: "flex", alignItems: "center" }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.type.toUpperCase()} • {file.size}
                      </Typography>
                    </Box>
                    <Tooltip title="Download">
                      <IconButton size="small">
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Status History
            </Typography>
            {statusHistory.map((history, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2"><strong>Date:</strong> {history.date}</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2"><strong>Status:</strong> {history.status}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2"><strong>User:</strong> {history.user}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2"><strong>Notes:</strong> {history.notes}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}

        {activeTab === 3 && rma.rmaType === "warranty" && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Warranty Information
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Warranty Status:</strong></Typography>
                  <Chip
                    label={rma.warrantyValid ? "VALID" : "EXPIRED"}
                    color={rma.warrantyValid ? "success" : "error"}
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Warranty Period:</strong> 12 months</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Purchase Date:</strong> 2024-01-01</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2"><strong>Warranty Expiry:</strong> 2024-12-31</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2"><strong>Validation Notes:</strong></Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}>
                    Warranty validated against purchase records. Product is within warranty period.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Comments Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Internal Comment
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Add internal note or comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<Comment />}
              onClick={handleAddComment}
              disabled={!comment.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {["pending", "under_review"].includes(rma.status) && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onUpdateStatus(rma.id, "rejected", "Rejected by admin")}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => onUpdateStatus(rma.id, "approved", "Approved by admin")}
            >
              Approve
            </Button>
          </>
        )}
        {rma.status === "approved" && (
          <Button
            variant="contained"
            startIcon={<Build />}
            onClick={() => onUpdateStatus(rma.id, "in_repair", "Sent for repair")}
          >
            Start Repair
          </Button>
        )}
        {rma.status === "in_repair" && (
          <Button
            variant="contained"
            startIcon={<LocalShipping />}
            onClick={() => onUpdateStatus(rma.id, "shipped", "Repaired and shipped")}
          >
            Mark as Shipped
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RMADetailsModal;
