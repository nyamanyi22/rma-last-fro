// src/components/super-admin/StaffManager.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Fade,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Refresh, Search } from "@mui/icons-material";
import superAdminService from "../../services/api/superAdminService";

const ROLE_COLORS = {
  super_admin: "error",
  admin: "warning",
  csr: "info",
};

const emptyForm = { first_name: "", last_name: "", email: "", role: "csr", password: "" };

const StaffManager = () => {
  const [staff, setStaff]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch]         = useState("");

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [currentStaff, setCurrentStaff] = useState(emptyForm);
  const [formError, setFormError]   = useState("");

  // ----------------------------------------------------------------
  // Fetch staff list
  // ----------------------------------------------------------------
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await superAdminService.getStaff({
        page: page + 1,
        per_page: rowsPerPage,
        search: search || undefined,
      });
      if (res.success) {
        setStaff(res.data.data || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load staff list.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ----------------------------------------------------------------
  // Dialog helpers
  // ----------------------------------------------------------------
  const openAdd = () => {
    setEditMode(false);
    setCurrentStaff(emptyForm);
    setFormError("");
    setOpenDialog(true);
  };

  const openEdit = (member) => {
    setEditMode(true);
    setCurrentStaff({
      id:         member.id,
      first_name: member.first_name,
      last_name:  member.last_name,
      email:      member.email,
      role:       member.role?.value ?? member.role,
      password:   "",
    });
    setFormError("");
    setOpenDialog(true);
  };

  const handleClose = () => setOpenDialog(false);

  const handleInput = (e) =>
    setCurrentStaff((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ----------------------------------------------------------------
  // Create / Update
  // ----------------------------------------------------------------
  const handleSubmit = async () => {
    setFormError("");

    if (!currentStaff.first_name || !currentStaff.last_name || !currentStaff.email) {
      setFormError("First name, last name and email are required.");
      return;
    }
    if (!editMode && !currentStaff.password) {
      setFormError("Password is required when creating a staff member.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        first_name: currentStaff.first_name,
        last_name:  currentStaff.last_name,
        email:      currentStaff.email,
        role:       currentStaff.role,
      };
      if (currentStaff.password) payload.password = currentStaff.password;

      let res;
      if (editMode) {
        res = await superAdminService.updateStaff(currentStaff.id, payload);
      } else {
        res = await superAdminService.createStaff(payload);
      }

      if (res.success) {
        setSuccess(res.message || (editMode ? "Staff updated." : "Staff created."));
        handleClose();
        fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setFormError(err.message || "Operation failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------------
  // Delete
  // ----------------------------------------------------------------
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete staff member "${name}"? This cannot be undone.`)) return;
    try {
      const res = await superAdminService.deleteStaff(id);
      if (res.success) {
        setSuccess(res.message || "Staff member deleted.");
        fetchStaff();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to delete staff member.");
    }
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Staff Management
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchStaff} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAdd}
            sx={{ borderRadius: 2, px: 3, textTransform: "none" }}
          >
            Add Staff
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {success && (
        <Fade in={!!success}>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>
        </Fade>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* Search bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          placeholder="Search by name or email…"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} /> }}
          sx={{ maxWidth: 400 }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h, i) => (
                <TableCell key={h} align={i === 5 ? "right" : "left"} sx={{ fontWeight: 600 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No staff members found.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => {
                const roleValue = member.role?.value ?? member.role;
                const fullName  = member.full_name || `${member.first_name} ${member.last_name}`;
                return (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light", fontSize: 14 }}>
                          {fullName[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>{fullName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={roleValue?.replace("_", " ").toUpperCase()}
                        size="small"
                        color={ROLE_COLORS[roleValue] || "default"}
                        variant="outlined"
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.is_active ? "Active" : "Inactive"}
                        size="small"
                        color={member.is_active ? "success" : "default"}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      {member.created_at
                        ? new Date(member.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(member)}
                          sx={{ color: "info.main", mr: 0.5 }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(member.id, fullName)}
                            disabled={member.role?.value === "super_admin" || member.role === "super_admin"}
                            sx={{ color: "error.main" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
          {editMode ? "Edit Staff Member" : "Add New Staff Member"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
          )}
          <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
            <TextField
              fullWidth label="First Name" name="first_name"
              value={currentStaff.first_name} onChange={handleInput} required
            />
            <TextField
              fullWidth label="Last Name" name="last_name"
              value={currentStaff.last_name} onChange={handleInput} required
            />
          </Box>
          <TextField
            fullWidth label="Email Address" name="email" type="email"
            value={currentStaff.email} onChange={handleInput}
            margin="normal" required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={currentStaff.role} onChange={handleInput} label="Role">
              <MenuItem value="csr">Customer Service Representative (CSR)</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="super_admin">Super Administrator</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth label={editMode ? "New Password (leave blank to keep)" : "Password"}
            name="password" type="password"
            value={currentStaff.password} onChange={handleInput}
            margin="normal" required={!editMode}
            helperText={editMode ? "Leave blank to keep the current password." : "Min 8 characters."}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={handleSubmit} variant="contained"
            disabled={saving}
            sx={{ borderRadius: 2, px: 3, minWidth: 110 }}
          >
            {saving ? <CircularProgress size={20} /> : (editMode ? "Update" : "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManager;
