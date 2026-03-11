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
  Fade,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Close,
  Download,
  Email,
  LocationOn,
  CalendarToday,
  Receipt,
  Build,
  LocalShipping,
  CheckCircle,
  Cancel,
  Comment,
  VisibilityOutlined,
  InsertDriveFileOutlined,
} from "@mui/icons-material";
import rmaService from "../../../services/api/rmaService";

const RMADetailsModal = ({ open, onClose, rma, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!rma) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      setSubmitting(true);
      try {
        const response = await rmaService.addComment(rma.id, comment, 'internal');
        if (response.success) {
          setComment("");
          alert("Internal comment added successfully");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ed6c02",
      under_review: "#0288d1",
      approved: "#2e7d32",
      rejected: "#d32f2f",
      in_repair: "#9c27b0",
      shipped: "#1976d2",
      completed: "#2e7d32",
    };
    return colors[status] || "#757575";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending Review",
      under_review: "Under Review",
      approved: "Approved",
      rejected: "Rejected",
      in_repair: "In Repair",
      shipped: "Shipped",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    return type === "return" ? "Simple Return" : "Warranty Claim";
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, backgroundImage: 'none' } }}
    >
      <DialogTitle sx={{ p: 3, pb: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>RMA Summary</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: 'monospace' }}>
              #{rma.rmaNumber}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ bgcolor: 'grey.100' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Header Summary */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>Status</Typography>
              <Chip
                label={getStatusLabel(rma.status)}
                sx={{
                  bgcolor: alpha(getStatusColor(rma.status), 0.1),
                  color: getStatusColor(rma.status),
                  fontWeight: 900,
                  borderRadius: 2
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>RMA Type</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{getTypeLabel(rma.rmaType)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>Priority</Typography>
              <Chip
                label={(rma.priority || 'medium').toUpperCase()}
                size="small"
                color={rma.priority === "high" ? "error" : "default"}
                sx={{ fontWeight: 800 }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Entity Overview" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label={`Documentation (${rma.attachments?.length || 0})`} sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Audit Logistics" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" /> Customer Entity
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: '30%' }}>Identity</TableCell>
                        <TableCell>{rma.customerName}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Account</TableCell>
                        <TableCell>{rma.customerEmail}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Contact</TableCell>
                        <TableCell>{rma.contactPhone}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Destination</TableCell>
                        <TableCell>{rma.shippingAddress}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt fontSize="small" /> Product Logistics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: '30%' }}>Asset</TableCell>
                        <TableCell>{rma.productName}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Serial/ID</TableCell>
                        <TableCell>{rma.serialNumber || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow sx={{ '& td': { border: 'none', py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Reason</TableCell>
                        <TableCell>
                          <Chip label={getReasonLabel(rma.reason)} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.3), border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Issue Narration</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {rma.issueDescription}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Box sx={{ py: 2 }}>
            {rma.attachments && rma.attachments.length > 0 ? (
              <Grid container spacing={2}>
                {rma.attachments.map((file, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: alpha('#1976d2', 0.02), borderColor: 'primary.main' }
                      }}
                    >
                      <InsertDriveFileOutlined sx={{ mr: 2, color: "primary.main" }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                          {file.filename || `File ${index + 1}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.mime_type || "Document"}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => window.open(file.file_url, "_blank")}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 8, textAlign: "center", bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No digital documentation was attached to this request.</Typography>
              </Box>
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ py: 2 }}>
            {rma.statusHistory && rma.statusHistory.length > 0 ? (
              rma.statusHistory.map((history, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>Timestamp</Typography>
                      <Typography variant="body2">{new Date(history.created_at).toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Chip
                        label={getStatusLabel(history.new_status)}
                        size="small"
                        sx={{ bgcolor: alpha(getStatusColor(history.new_status), 0.1), color: getStatusColor(history.new_status), fontWeight: 800 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>Modifier</Typography>
                      <Typography variant="body2">{history.changed_by?.name || 'System Auto'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>Operational Notes</Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{history.notes || 'None recorded'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))
            ) : (
              <Box sx={{ py: 8, textAlign: "center", bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>No audit logistics trail exists for this transaction.</Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            size="small"
            placeholder="Add internal operational note..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleAddComment} disabled={!comment.trim() || submitting} size="small" color="primary">
                  <Comment />
                </IconButton>
              )
            }}
          />
        </Box>
        <Button onClick={onClose} variant="text" sx={{ borderRadius: 2, fontWeight: 700 }}>Dismiss</Button>
        {["pending", "under_review"].includes(rma.status) && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => onUpdateStatus(rma.id, "rejected", "Rejected by administrative review")}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Deny
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => onUpdateStatus(rma.id, "approved", "Approved by administrative review")}
              disabled={rma.requiresWarrantyCheck && rma.isWarrantyValid === null}
              sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
            >
              Approve
            </Button>
          </>
        )}
        {rma.status === "approved" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Build />}
            onClick={() => onUpdateStatus(rma.id, "in_repair", "Sent for repair")}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Start Repair
          </Button>
        )}
        {rma.status === "in_repair" && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<LocalShipping />}
            onClick={() => onUpdateStatus(rma.id, "shipped", "Repaired and shipped to customer")}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Mark as Shipped
          </Button>
        )}
        {rma.status === "shipped" && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => onUpdateStatus(rma.id, "completed", "RMA transaction successfully completed")}
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Complete Transaction
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RMADetailsModal;
