// src/pages/super-admin/SuperAdminHome.jsx
import React from "react";

import { Container, Typography, Paper, Box, Button, Grid, Tabs, Tab } from "@mui/material";
import { 
  People, 
  Settings, 
  Security,
  BarChart,
  Notifications,
  AdminPanelSettings
} from "@mui/icons-material";
import StaffManager from "../../components/super-admin/StaffManager";

const SuperAdminHome = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const systemStats = [
    { label: "Total Users", value: "156", icon: <People />, color: "primary.main" },
    { label: "Active Staff", value: "12", icon: <AdminPanelSettings />, color: "secondary.main" },
    { label: "Pending RMAs", value: "23", icon: <Notifications />, color: "warning.main" },
    { label: "System Health", value: "100%", icon: <BarChart />, color: "success.main" },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4">
              Super Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome, {user?.name || "Super Admin"} | System Administrator
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {systemStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 3, display: "flex", alignItems: "center" }}>
              <Box sx={{ color: stat.color, mr: 2 }}>
                {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
              </Box>
              <Box>
                <Typography variant="h4">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content with Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<People />} label="Staff Management" />
            <Tab icon={<Security />} label="System Security" />
            <Tab icon={<Settings />} label="System Settings" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <StaffManager />}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure system security parameters, audit logs, and access controls.
              </Typography>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="body2">
                  Security features will be implemented here.
                </Typography>
              </Paper>
            </Box>
          )}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                System Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure system-wide settings, email templates, and branding.
              </Typography>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="body2">
                  System configuration will be implemented here.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent System Activities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activities to display.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Warnings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All systems operational. No warnings.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SuperAdminHome;
