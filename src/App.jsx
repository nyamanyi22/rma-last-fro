import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RMAManagement from './pages/admin/RMAManagement';

// Components
import CustomerLogin from './components/auth/CustomerLogin';
import StaffLogin from './components/auth/StaffLogin';
import Register from './components/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientRMAHistory from './pages/client/ClientRMAHistory';
import ClientProfile from './pages/client/ClientProfile';
import RMADetails from './pages/client/RMADetails';
import AdminDashboard from './pages/admin/AdminHome';
import NewRMA from './pages/client/NewRMA';
import ProductManagement from './pages/admin/ProductManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import SalesManagement from './pages/admin/SalesManagement';
import RMAReports from './pages/admin/RMAReports';
import AdminLayout from './layouts/AdminLayout';

// Client Layout
import ClientLayout from './layouts/ClientLayout';

// Super Admin Components
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import StaffManager from './components/super-admin/StaffManager';
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings';
import SuperAdminSecurity from './pages/super-admin/SuperAdminSecurity';
import SuperAdminReports from './pages/super-admin/SuperAdminReports';
import SuperAdminSalesManagement from './pages/super-admin/SuperAdminSalesManagement';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Simple route protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }

  if (!user || !user.role) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/admin/login" element={<StaffLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Customer Routes - SINGLE DEFINITION */}
            <Route path="/client" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ClientLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="rma/new" element={<NewRMA />} />
              <Route path="rma/history" element={<ClientRMAHistory />} />
              <Route path="profile" element={<ClientProfile />} />
              <Route path="rma/:id" element={<RMADetails />} />
            </Route>

            {/* Admin/CSR Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'csr', 'super_admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="rma" element={<RMAManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="reports" element={<RMAReports />} />

              {/* Placeholders for now */}
              <Route path="settings" element={<div style={{ padding: 20 }}>Settings Module Coming Soon</div>} />
              <Route path="notifications" element={<div style={{ padding: 20 }}>Notifications Module Coming Soon</div>} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="staff" element={<StaffManager />} />
              <Route path="rma" element={<RMAManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="settings" element={<SuperAdminSettings />} />
              <Route path="security" element={<SuperAdminSecurity />} />
              <Route path="reports" element={<SuperAdminReports />} />
              <Route path="sales" element={<SuperAdminSalesManagement />} />
            </Route>

            {/* 404 Routes */}
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;