import React from "react";
import { Container, Typography, Paper, Box, Button, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  Assignment,
  People,
  Inventory,
  BarChart,
  Notifications,
  Settings
} from "@mui/icons-material";

const AdminHome = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Mock stats - in real app, fetch from API
  const stats = {
    pendingRMAs: 12,
    totalCustomers: 45,
    totalProducts: 120,
    activeNotifications: 3,
  };

  const quickActions = [
    {
      icon: <Assignment />,
      label: "RMA Management",
      count: stats.pendingRMAs,
      color: "primary.main",
      path: "/admin/rma"
    },
    {
      icon: <People />,
      label: "Manage Customers",
      count: stats.totalCustomers,
      color: "secondary.main",
      path: "/admin/customers"
    },
    {
      icon: <Inventory />,
      label: "Products",
      count: stats.totalProducts,
      color: "success.main",
      path: "/admin/products"
    },
    {
      icon: <BarChart />,
      label: "Reports",
      count: 5,
      color: "warning.main",
      path: "/admin/reports"
    },
    {
      icon: <Notifications />,
      label: "Notifications",
      count: stats.activeNotifications,
      color: "info.main",
      path: "/admin/notifications"
    },
    {
      icon: <Settings />,
      label: "Settings",
      count: null,
      color: "grey.700",
      path: "/admin/settings"
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4">
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.name || "Admin"} ({user?.role?.toUpperCase() || "ADMIN"})
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Quick Actions Grid */}
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-4px)",
                  transition: "all 0.3s ease"
                }
              }}
              component={RouterLink}
              to={action.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box sx={{ color: action.color, mr: 2 }}>
                {React.cloneElement(action.icon, { sx: { fontSize: 40 } })}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{action.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.count !== null ? `${action.count} items` : "System configuration"}
                </Typography>
              </Box>
              <Button
                variant="text"
                sx={{ ml: 2 }}
                component="span"
              >
                View
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity & Stats */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent RMA Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Typography variant="h5" align="center">{stats.pendingRMAs}</Typography>
                    <Typography variant="body2" align="center">Pending RMAs</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h5" align="center">8</Typography>
                    <Typography variant="body2" align="center">Under Review</Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Recent activities will be displayed here. Click "RMA Management" to view and process all RMAs.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Users:</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.totalCustomers + 5}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Active RMAs:</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.pendingRMAs + 8}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Products:</Typography>
                <Typography variant="body2" fontWeight="bold">{stats.totalProducts}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">System:</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">Operational</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Tips */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Tips:
        </Typography>
        <Typography variant="body2">
          • Use the <strong>RMA Management</strong> section to review and process return/warranty requests
          <br />
          • Check <strong>Notifications</strong> for pending customer messages
          <br />
          • Update <strong>Products</strong> catalog when new items arrive
          <br />
          • Generate <strong>Reports</strong> for monthly analytics
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminHome;