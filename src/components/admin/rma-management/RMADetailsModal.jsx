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
  TableHead,
  TableCell,
  TableRow,
  TextField,
  IconButton,
  CircularProgress,
  MenuItem,
  Divider,
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
import { History, Description, AccountCircle } from "@mui/icons-material";

const RMADetailsModal = ({ open, onClose, rma, onUpdateStatus, onRefresh }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [internalComment, setInternalComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Auth context
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStaff = ["csr", "admin", "super_admin"].includes(user.role);

  // Rejection States
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [rejectionDetail, setRejectionDetail] = useState("");

  // Shipping state
  const [shippingCarrier, setShippingCarrier] = useState(rma.carrier || "");
  const [trackingNumber, setTrackingNumber] = useState(rma.trackingNumber || "");

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
          if (onRefresh) onRefresh();
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

  const handleUpdateShipping = async () => {
    setSubmitting(true);
    try {
      const response = await rmaService.updateShipping(rma.id, shippingCarrier, trackingNumber);
      if (response.success) {
        if (onRefresh) onRefresh();
        setActiveTab(0); // Go back to overview
      }
    } catch (error) {
      console.error("Error updating shipping:", error);
    } finally {
      setSubmitting(false);
    }
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
          {isStaff && <Tab label="Audit Logistics" sx={{ fontWeight: 700, textTransform: 'none' }} />}
          {isStaff && <Tab label="Shipping Info" sx={{ fontWeight: 700, textTransform: 'none' }} />}
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
                {rma.trackingNumber && (
                  <>
                    <Divider sx={{ my: 1, borderStyle: 'dotted' }} />
                    <Typography variant="body2"><strong>Carrier:</strong> {rma.carrier}</Typography>
                    <Typography variant="body2"><strong>Tracking:</strong> {rma.trackingNumber}</Typography>
                  </>
                )}
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

        {isStaff && activeTab === 2 && (
          <Grid container spacing={3}>
            {/* Status History */}
            <Grid item xs={12} lg={7}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History fontSize="small" /> Status Change History
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: '2px solid', borderColor: 'divider' } }}>
                      <TableCell>Date</TableCell>
                      <TableCell>Transition</TableCell>
                      <TableCell>Authorized By</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rma.statusHistory?.length > 0 ? (
                      rma.statusHistory.map((history) => (
                        <TableRow key={history.id} sx={{ '& td': { borderBottom: '1px solid', borderColor: alpha('#000', 0.05) } }}>
                          <TableCell sx={{ whiteSpace: 'nowrap', py: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{history.formattedDate}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{history.oldStatusLabel}</Typography>
                              <PlayArrow sx={{ fontSize: 10, color: 'text.disabled' }} />
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{history.newStatusLabel}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{history.changedByName}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{history.notes || '—'}</Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="caption" color="text.disabled">No history records found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Internal Staff Notes */}
            <Grid item xs={12} lg={5}>
              <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description fontSize="small" /> Internal Operational Notes
                </Typography>

                <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, maxHeight: 300, pr: 1 }}>
                  {(rma.comments?.filter(c => String(c.type).toLowerCase() === 'internal') || []).length > 0 ? (
                    rma.comments
                      .filter(c => String(c.type).toLowerCase() === 'internal')
                      .map((note) => (
                    <Box key={note.id} sx={{ mb: 2, p: 1.5, bgcolor: alpha('#f5f5f5', 0.5), borderRadius: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccountCircle sx={{ fontSize: 14 }} /> {note.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{note.formattedDate}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>{note.comment}</Typography>
                    </Box>
                  ))) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.disabled">No internal notes yet.</Typography>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />
                <Box>
                  <TextField
                    multiline
                    fullWidth
                    rows={2}
                    placeholder="Type new operational note..."
                    value={internalComment}
                    onChange={(e) => setInternalComment(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha('#fff', 0.5) } }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddInternalNote}
                    disabled={!internalComment.trim() || submitting}
                    sx={{ mt: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    {submitting ? <CircularProgress size={20} /> : 'Post Private Note'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && isStaff && (
          <Box sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: alpha('#f8fafc', 0.5) }}>
              <LocalShipping sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Update Logistics Tracking</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Enter the shipping carrier and tracking number below. Saving this will automatically mark the RMA as **Shipped** and notify the customer.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Shipping Carrier"
                    placeholder="e.g., FedEx, UPS, DHL"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    placeholder="Enter tracking ID"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LocalShipping />}
                onClick={handleUpdateShipping}
                disabled={submitting || !shippingCarrier || !trackingNumber}
                sx={{ mt: 4, borderRadius: 3, py: 1.5, fontWeight: 800, textTransform: 'none', boxShadow: 3 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Save & Mark as Shipped'}
              </Button>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        {!isRejecting ? (
          <>
            <Button onClick={onClose} sx={{ ml: 'auto' }}>Dismiss</Button>

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
                  <Button variant="contained" color="primary" startIcon={<LocalShipping />} onClick={() => setActiveTab(3)}>Process Shipment</Button>
                )}
              </>
            )}

            {rma.status === "in_repair" && ["warranty", "repair", "warranty_repair"].includes(rma.rmaType) && (
              <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => onUpdateStatus(rma.id, "repaired", "Repair completed successfully")}>Mark as Repaired</Button>
            )}

            {rma.status === "repaired" && (
              <Button variant="contained" color="primary" startIcon={<LocalShipping />} onClick={() => setActiveTab(3)}>Process Shipment</Button>
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
        <DialogTitle component="div" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{previewFile?.name || "Preview"}</Typography>
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