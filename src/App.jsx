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
import AdminProfile from './pages/admin/AdminProfile';
import AdminCreateRMA from './pages/admin/AdminCreateRMA';
import AdminNotifications from './pages/admin/AdminNotifications';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';

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
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
    },
    secondary: {
      main: '#a855f7',
      dark: '#7c3aed',
      light: '#c084fc',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Simple route protection
const ProtectedRoute = ({ children, allowedRoles, fallback = "/unauthorized" }) => {
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
    return <Navigate to={fallback} />;
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
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
              <Route path="rma/new" element={<AdminCreateRMA />} />
              
              {/* Restricted Admin Routes */}
              <Route path="products" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']} fallback="/admin/dashboard">
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="customers" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']} fallback="/admin/dashboard">
                  <CustomerManagement />
                </ProtectedRoute>
              } />
              <Route path="sales" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']} fallback="/admin/dashboard">
                  <SalesManagement />
                </ProtectedRoute>
              } />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']} fallback="/admin/dashboard">
                  <RMAReports />
                </ProtectedRoute>
              } />
              
              <Route path="profile" element={<AdminProfile />} />

              {/* Placeholders for now */}
              <Route path="notifications" element={<AdminNotifications />} />
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
              <Route path="profile" element={<AdminProfile />} />
              <Route path="notifications" element={<AdminNotifications />} />
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