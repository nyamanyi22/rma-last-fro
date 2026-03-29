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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Close,
  Download,
  Email,
  Receipt,
  Build,
  CheckCircle,
  Cancel,
  Comment,
  VisibilityOutlined,
  InsertDriveFileOutlined,
  ArrowBack,
  PlayArrow,
  Warehouse,
  CheckCircleOutline,
  LocalShipping,
  DoneAll,
} from "@mui/icons-material";
import rmaService from "../../../services/api/rmaService";

const RMADetailsModal = ({ open, onClose, rma, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [internalComment, setInternalComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Rejection States
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [rejectionDetail, setRejectionDetail] = useState("");

  if (!rma) return null;

  const handlePreviewOpen = async (file) => {
    try {
      setPreviewLoading(true);
      setPreviewFile({ ...file, localUrl: null });
      const downloadEndpoint = `/admin/rma/attachments/${file.id}/download`;
      const blob = await rmaService.getFileBlob(downloadEndpoint);
      const url = URL.createObjectURL(blob);
      setPreviewFile({ ...file, localUrl: url, blob });
    } catch (error) {
      console.error("Failed to load file preview", error);
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewClose = () => {
    if (previewFile?.localUrl) URL.revokeObjectURL(previewFile.localUrl);
    setPreviewFile(null);
  };

  const handleAddInternalNote = async () => {
    if (internalComment.trim()) {
      setSubmitting(true);
      try {
        const response = await rmaService.addComment(rma.id, internalComment, 'internal');
        if (response.success) {
          setInternalComment("");
          alert("Internal note added successfully");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const confirmRejection = () => {
    if (!rejectionCategory || !rejectionDetail) return;

    // Sends the status update with the structured rejection data
    onUpdateStatus(rma.id, "rejected", {
      rejection_reason: rejectionCategory,
      customer_message: rejectionDetail
    });

    setIsRejecting(false);
    setRejectionCategory("");
    setRejectionDetail("");
  };

  const getRejectionOptions = () => {
    const common = [
      "Insufficient proof of issue",
      "Product outside warranty period",
      "Customer-induced damage",
      "Missing required documents",
    ];
    return rma.rmaType === "return" ? ["Return period expired", "Product used/opened", ...common] : common;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ed6c02",
      under_review: "#0288d1",
      approved: "#2e7d32",
      rejected: "#d32f2f",
      in_repair: "#9c27b0",
      repaired: "#2e7d32",
      ready_for_shipment: "#1976d2",
      shipped: "#1976d2",
      delivered: "#2e7d32",
      completed: "#2e7d32",
      cancelled: "#757575",
    };
    return colors[status] || "#120f0fff";
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
          <IconButton onClick={onClose} sx={{ bgcolor: 'grey.100' }}><Close /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Restored Summary Cards */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>Status</Typography>
              <Chip
                label={rma.statusLabel?.toUpperCase()}
                sx={{ bgcolor: alpha(getStatusColor(rma.status), 0.1), color: getStatusColor(rma.status), fontWeight: 900, borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>RMA Type</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{rma.rmaType?.replace('_', ' ').toUpperCase()}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" sx={{ fontWeight: 700, display: 'block' }}>Priority</Typography>
              <Chip label={(rma.priority || 'medium').toUpperCase()} size="small" color={rma.priority === "high" ? "error" : "default"} sx={{ fontWeight: 800 }} />
            </Grid>
          </Grid>
        </Paper>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Entity Overview" sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label={`Documentation (${rma.attachments?.length || 0})`} sx={{ fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Audit Logistics" sx={{ fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" /> Customer Entity
                </Typography>
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
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt fontSize="small" /> Product Logistics
                </Typography>
                <Typography variant="body2"><strong>Asset:</strong> {rma.productName}</Typography>
                <Typography variant="body2"><strong>Serial:</strong> {rma.serialNumber || 'N/A'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.3), border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Issue Narration</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{rma.issueDescription}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={2}>
            {rma.attachments?.map((file, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Paper sx={{ p: 1.5, display: "flex", alignItems: "center", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <InsertDriveFileOutlined sx={{ mr: 2, color: "primary.main" }} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{file.name || 'File'}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handlePreviewOpen(file)}>
                    <VisibilityOutlined fontSize="small" />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        {!isRejecting ? (
          <>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                size="small"
                placeholder="Add internal operational note..."
                value={internalComment}
                onChange={(e) => setInternalComment(e.target.value)}
                sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={handleAddInternalNote} disabled={!internalComment.trim() || submitting} size="small" color="primary">
                      <Comment />
                    </IconButton>
                  )
                }}
              />
            </Box>
            <Button onClick={onClose}>Dismiss</Button>

            {/* RMA Status Transition Workflow */}
            {/* DENY — available during review phase */}
            {["pending", "under_review"].includes(rma.status) && (
              <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setIsConfirmingReject(true)}>Deny</Button>
            )}

            {/* PENDING: can Process (→ under_review) OR Approve directly (→ approved) */}
            {rma.status === "pending" && (
              <>
                <Button variant="outlined" color="primary" startIcon={<PlayArrow />} onClick={() => onUpdateStatus(rma.id, "under_review", "Moving to review stage")}>Under Review</Button>
                <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => onUpdateStatus(rma.id, "approved", "RMA Approved")}>Approve</Button>
              </>
            )}

            {/* UNDER REVIEW: Approve */}
            {rma.status === "under_review" && (
              <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => onUpdateStatus(rma.id, "approved", "RMA Approved")}>Approve</Button>
            )}

            {/* Stage 2 & 3: Execution Phase (Track Dependent) */}
            {rma.status === "approved" && (
              <>
                {["warranty", "repair", "warranty_repair"].includes(rma.rmaType) ? (
                  /* Technical Track */
                  <Button variant="contained" color="secondary" startIcon={<Build />} onClick={() => onUpdateStatus(rma.id, "in_repair", "Starting technical repair")}>Start Repair</Button>
                ) : (
                  /* Fast Track (Simple Returns/Exchanges) */
                  <Button variant="contained" color="primary" startIcon={<LocalShipping />} onClick={() => onUpdateStatus(rma.id, "shipped", "Direct shipment initiated")}>Ship Now</Button>
                )}
              </>
            )}

            {rma.status === "in_repair" && ["warranty", "repair", "warranty_repair"].includes(rma.rmaType) && (
              <Button variant="contained" color="primary" startIcon={<LocalShipping />} onClick={() => onUpdateStatus(rma.id, "shipped", "Repair completed, shipping back")}>Mark as Shipped</Button>
            )}

            {/* Stage 4: Closure (Both tracks) */}
            {rma.status === "shipped" && (
              <Button variant="contained" color="success" startIcon={<DoneAll />} onClick={() => onUpdateStatus(rma.id, "completed", "RMA finalized")}>Complete RMA</Button>
            )}
          </>
        ) : (
          /* Restored Rejection Mode with New Custom Detail Field */
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2, p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => setIsRejecting(false)}><ArrowBack /></IconButton>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Rejection Feedback for Customer</Typography>
            </Box>
            <TextField
              select
              fullWidth
              size="small"
              label="Official Rejection Category"
              value={rejectionCategory}
              onChange={(e) => setRejectionCategory(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            >
              {getRejectionOptions().map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Specific Explanation (Public)"
              placeholder="Explain to the customer why this was rejected..."
              value={rejectionDetail}
              onChange={(e) => setRejectionDetail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={confirmRejection}
              disabled={!rejectionCategory || !rejectionDetail}
              sx={{ borderRadius: 2, py: 1, fontWeight: 800 }}
            >
              Confirm & Notify Customer
            </Button>
          </Box>
        )}
      </DialogActions>

      {/* Rejection Confirmation Dialog */}
      <Dialog
        open={isConfirmingReject}
        onClose={() => setIsConfirmingReject(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ bgcolor: 'error.100', borderRadius: '50%', p: 1, display: 'flex' }}>
            <Cancel sx={{ color: 'error.main' }} />
          </Box>
          Reject this RMA?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to reject this RMA? <strong>This action will notify the customer</strong> with the reason you provide.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setIsConfirmingReject(false)}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, fontWeight: 700 }}
            onClick={() => {
              setIsConfirmingReject(false);
              setIsRejecting(true);
            }}
          >
            Yes, Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Preview Overlay */}
      <Dialog open={!!previewFile} onClose={handlePreviewClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{previewFile?.name || "Preview"}</Typography>
          <IconButton onClick={handlePreviewClose}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '60vh', bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'center' }}>
          {previewLoading ? <CircularProgress sx={{ m: 'auto' }} /> : (
            previewFile?.localUrl && (
              previewFile.mimeType === 'application/pdf' ?
                <object data={previewFile.localUrl} type="application/pdf" width="100%" height="100%" /> :
                <img src={previewFile.localUrl} style={{ maxWidth: '100%', objectFit: 'contain' }} alt="Preview" />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Download />} href={previewFile?.localUrl} download={previewFile?.name}>Download</Button>
          <Button onClick={handlePreviewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default RMADetailsModal;