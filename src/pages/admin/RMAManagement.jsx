import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  FilterList,
  Refresh,
  Download,
  Visibility,
  CheckCircle,
  Cancel,
  Comment,
  Assignment,
} from "@mui/icons-material";
import RMAFilters from "../../components/admin/rma-management/RMAFilters";
import RMAList from "../../components/admin/rma-management/RMAList";
import RMADetailsModal from "../../components/admin/rma-management/RMADetailsModal";
import RMAReviewModal from "../../components/admin/rma-management/RMAReviewModal";

import rmaService from "../../services/api/rmaService";

const RMAManagement = () => {
  const [activeTab, setActiveTab] = useState(4); // Default to "All RMAs"
  const [rmaList, setRmaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    rmaType: "all",
    priority: "all",
    dateRange: "all",
  });
  const [selectedRma, setSelectedRma] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  // User info
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch stats separately
  const fetchStats = async () => {
    try {
      const response = await rmaService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Fetch RMAs from API
  const fetchRmas = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search: searchQuery,
        status: filters.status === "all" ? undefined : filters.status,
        rma_type: filters.rmaType === "all" ? undefined : filters.rmaType,
        priority: filters.priority === "all" ? undefined : filters.priority,
      };

      const response = await rmaService.getRmas(params);
      if (response.success) {
        setRmaList(response.data.data);
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total
        });
      }
    } catch (error) {
      console.error("Error fetching RMAs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when filters/search change
  useEffect(() => {
    fetchStats();
    fetchRmas(1);
  }, [filters, searchQuery]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update status filter based on tab
    const statusMap = ["pending", "under_review", "approved", "rejected", "all"];
    setFilters(prev => ({ ...prev, status: statusMap[newValue] }));
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      rmaType: "all",
      priority: "all",
      dateRange: "all",
    });
    setSearchQuery("");
  };

  const handleViewDetails = async (rma) => {
    // Fetch full details for the modal
    setLoading(true);
    try {
      const response = await rmaService.getRmaAdmin(rma.id);
      if (response.success) {
        setSelectedRma(response.data);
        setDetailsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching RMA details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRma = async (rma) => {
    // Fetch full details for the modal
    setLoading(true);
    try {
      const response = await rmaService.getRmaAdmin(rma.id);
      if (response.success) {
        setSelectedRma(response.data);
        setReviewModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching RMA details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rmaId, newStatus, adminNotes = "", rejectionReason = null) => {
    setLoading(true);
    try {
      const response = await rmaService.updateRma(rmaId, {
        status: newStatus,
        admin_notes: adminNotes,
        rejection_reason: rejectionReason
      });

      if (response.success) {
        // Refresh list and stats
        fetchStats();
        fetchRmas(pagination.current_page);

        // Close modals
        setDetailsModalOpen(false);
        setReviewModalOpen(false);

        // Success notification could go here
        alert(`RMA ${response.data.rmaNumber} updated to ${newStatus}`);
      }
    } catch (error) {
      console.error("Error updating RMA status:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Here we could implement a real export if backend supports it
      // For now, let's just export current list
      const csvContent = [
        ["RMA Number", "Customer", "Product", "Type", "Status", "Submitted Date"],
        ...rmaList.map(rma => [
          rma.rmaNumber,
          rma.customerName,
          rma.productName,
          rma.type,
          rma.status,
          rma.formattedDate,
        ]),
      ]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rma_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } catch (error) {
      console.error("Error exporting RMAs:", error);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchRmas(pagination.current_page);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4">
            RMA Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Logged in as: {user.name} ({user.role})
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "left",
                background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
                color: "white",
                borderRadius: 4,
                boxShadow: "0 8px 16px rgba(245, 124, 0, 0.2)",
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Pending</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.pending}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "left",
                background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                color: "white",
                borderRadius: 4,
                boxShadow: "0 8px 16px rgba(25, 118, 210, 0.2)",
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Under Review</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.under_review}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "left",
                background: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
                color: "white",
                borderRadius: 4,
                boxShadow: "0 8px 16px rgba(56, 142, 60, 0.2)",
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Approved</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.approved}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: "left",
                background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
                color: "white",
                borderRadius: 4,
                boxShadow: "0 8px 16px rgba(211, 47, 47, 0.2)",
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Rejected</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{stats.rejected}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Actions */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
          <TextField
            placeholder="Search RMA, customer, or product..."
            value={searchQuery}
            onChange={handleSearch}
            fullWidth
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'white',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{ bgcolor: 'grey.100', borderRadius: 2 }}
              >
                <Refresh />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Export CSV">
            <IconButton
              onClick={handleExport}
              sx={{ bgcolor: 'grey.100', borderRadius: 2 }}
            >
              <Download />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {/* Will implement filter drawer */ }}
            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
          >
            Filters
          </Button>
        </Box>

        {/* Results Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {rmaList.length} of {stats.total} RMAs
          </Typography>
          {filters.status !== "all" && (
            <Chip
              label={`Filtered: ${filters.status}`}
              onDelete={handleClearFilters}
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <RMAFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* RMA List */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label={`Pending (${stats.pending})`} />
                <Tab label={`Under Review (${stats.under_review})`} />
                <Tab label={`Approved (${stats.approved})`} />
                <Tab label={`Rejected (${stats.rejected})`} />
                <Tab label="All RMAs" />
              </Tabs>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <RMAList
                rmas={rmaList}
                onViewDetails={handleViewDetails}
                onReview={handleReviewRma}
                userRole={user.role}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modals */}
      {selectedRma && (
        <>
          <RMADetailsModal
            open={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            rma={selectedRma}
            onUpdateStatus={handleUpdateStatus}
          />

          <RMAReviewModal
            open={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            rma={selectedRma}
            onUpdateStatus={handleUpdateStatus}
          />
        </>
      )}
    </Container>
  );
};

export default RMAManagement;
