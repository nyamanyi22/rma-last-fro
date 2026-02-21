// src/components/super-admin/StaffManager.jsx
import React, { useState } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Fade
} from "@mui/material";
import { Add, Edit, Delete, Email, Search, FilterList } from "@mui/icons-material";

// Mock staff database
const initialStaff = [
  { id: 2, name: "Admin User", email: "admin@example.com", role: "admin", is_active: true, created_at: "2024-01-15" },
  { id: 3, name: "CSR Agent", email: "csr@example.com", role: "csr", is_active: true, created_at: "2024-01-20" },
];

const StaffManager = () => {
  const [staff, setStaff] = useState(initialStaff);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    name: "",
    email: "",
    role: "csr",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenDialog = (staffMember = null) => {
    if (staffMember) {
      setEditMode(true);
      setCurrentStaff(staffMember);
    } else {
      setEditMode(false);
      setCurrentStaff({ name: "", email: "", role: "csr" });
    }
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setCurrentStaff({
      ...currentStaff,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setError("");
    setSuccess("");

    // Validation
    if (!currentStaff.name || !currentStaff.email) {
      setError("Name and email are required");
      return;
    }

    if (!currentStaff.email.includes("@")) {
      setError("Invalid email address");
      return;
    }

    // Check if email already exists (except in edit mode)
    const emailExists = staff.some(
      (s) => s.email === currentStaff.email && (!editMode || s.id !== currentStaff.id)
    );

    if (emailExists) {
      setError("Email already registered");
      return;
    }

    if (editMode) {
      // Update existing staff
      setStaff(staff.map(s =>
        s.id === currentStaff.id ? { ...currentStaff, id: s.id } : s
      ));
      setSuccess("Staff member updated successfully");
    } else {
      // Add new staff
      const newStaff = {
        ...currentStaff,
        id: Date.now(),
        is_active: true,
        created_at: new Date().toISOString().split('T')[0],
      };
      setStaff([...staff, newStaff]);
      setSuccess("Staff member created successfully");

      // In real app, send invitation email here
      console.log("Sending invitation email to:", newStaff.email);
    }

    setTimeout(() => {
      handleCloseDialog();
      setSuccess("");
    }, 2000);
  };

  const handleToggleStatus = (id) => {
    setStaff(staff.map(s =>
      s.id === id ? { ...s, is_active: !s.is_active } : s
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      setStaff(staff.filter(s => s.id !== id));
      setSuccess("Staff member deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleSendInvitation = (email) => {
    // In real app, resend invitation email
    alert(`Invitation email sent to ${email}`);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Staff Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontSize: '1rem' }}
        >
          Add Staff
        </Button>
      </Box>

      {success && (
        <Fade in={!!success}>
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {success}
          </Alert>
        </Fade>
      )}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search staff..."
          size="small"
          fullWidth
          InputProps={{ startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} /> }}
          sx={{ maxWidth: 400 }}
        />
        <IconButton><FilterList /></IconButton>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14 }}>
                      {staffMember.name[0]}
                    </Avatar>
                    <Typography variant="body2" fontWeight={500}>
                      {staffMember.name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>
                  <Chip
                    label={staffMember.role.replace('_', ' ').toUpperCase()}
                    size="small"
                    color={
                      staffMember.role === 'super_admin' ? 'error' :
                        staffMember.role === 'admin' ? 'warning' :
                          'info'
                    }
                    variant="outlined"
                    sx={{ borderRadius: 1, fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={staffMember.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={staffMember.is_active ? "success" : "default"}
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>{staffMember.created_at}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleSendInvitation(staffMember.email)}
                    title="Resend invitation"
                    sx={{ color: 'primary.main', bgcolor: 'primary.lighter', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}
                  >
                    <Email fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(staffMember)}
                    title="Edit"
                    sx={{ ml: 1, color: 'info.main', bgcolor: 'info.lighter', '&:hover': { bgcolor: 'info.light', color: 'white' } }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(staffMember.id)}
                    title="Delete"
                    disabled={staffMember.role === 'super_admin'}
                    sx={{ ml: 1, color: 'error.main', bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light', color: 'white' } }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          {editMode ? "Edit Staff Member" : "Add New Staff Member"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={currentStaff.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={currentStaff.email}
              onChange={handleInputChange}
              margin="normal"
              required
              helperText="Invitation will be sent to this email"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={currentStaff.role}
                onChange={handleInputChange}
                label="Role"
              >
                <MenuItem value="csr">Customer Service Representative (CSR)</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="super_admin">Super Administrator</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2, px: 3 }}>
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManager;
