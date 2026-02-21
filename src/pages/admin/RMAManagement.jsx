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

// Mock RMA data
const MOCK_RMAS = [
  {
    id: 1,
    rmaNumber: "RMA-2024-0001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    productName: "Dell XPS 13 Laptop",
    rmaType: "warranty",
    reason: "product_failure",
    status: "pending",
    submittedDate: "2024-01-15",
    warrantyValid: null,
    requiresWarrantyCheck: true,
    priority: "high",
    attachments: 3,
  },
  {
    id: 2,
    rmaNumber: "RMA-2024-0002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    productName: "Logitech MX Master 3",
    rmaType: "return",
    reason: "shipping_damage",
    status: "under_review",
    submittedDate: "2024-01-14",
    warrantyValid: null,
    requiresWarrantyCheck: false,
    priority: "medium",
    attachments: 2,
  },
  {
    id: 3,
    rmaNumber: "RMA-2024-0003",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    productName: "HP Pavilion Desktop",
    rmaType: "warranty",
    reason: "hardware_defect",
    status: "approved",
    submittedDate: "2024-01-13",
    warrantyValid: true,
    requiresWarrantyCheck: true,
    priority: "low",
    attachments: 4,
  },
  {
    id: 4,
    rmaNumber: "RMA-2024-0004",
    customerName: "Alice Brown",
    customerEmail: "alice@example.com",
    productName: "Samsung 27\" Monitor",
    rmaType: "return",
    reason: "wrong_item",
    status: "rejected",
    submittedDate: "2024-01-12",
    warrantyValid: null,
    requiresWarrantyCheck: false,
    priority: "medium",
    attachments: 1,
  },
  {
    id: 5,
    rmaNumber: "RMA-2024-0005",
    customerName: "Charlie Wilson",
    customerEmail: "charlie@example.com",
    productName: "Apple MacBook Pro 14\"",
    rmaType: "warranty",
    reason: "performance_issue",
    status: "in_repair",
    submittedDate: "2024-01-10",
    warrantyValid: true,
    requiresWarrantyCheck: true,
    priority: "high",
    attachments: 5,
  },
];

const RMAManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [rmaList, setRmaList] = useState(MOCK_RMAS);
  const [filteredRmas, setFilteredRmas] = useState(MOCK_RMAS);
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
    underReview: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // User info
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Calculate stats
  useEffect(() => {
    const pending = rmaList.filter(r => r.status === "pending").length;
    const underReview = rmaList.filter(r => r.status === "under_review").length;
    const approved = rmaList.filter(r => r.status === "approved").length;
    const rejected = rmaList.filter(r => r.status === "rejected").length;
    
    setStats({
      pending,
      underReview,
      approved,
      rejected,
      total: rmaList.length,
    });
  }, [rmaList]);

  // Apply filters
  useEffect(() => {
    let filtered = [...rmaList];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(rma =>
        rma.rmaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rma.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rma.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rma.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(rma => rma.status === filters.status);
    }

    // Apply RMA type filter
    if (filters.rmaType !== "all") {
      filtered = filtered.filter(rma => rma.rmaType === filters.rmaType);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(rma => rma.priority === filters.priority);
    }

    setFilteredRmas(filtered);
  }, [rmaList, searchQuery, filters]);

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

  const handleViewDetails = (rma) => {
    setSelectedRma(rma);
    setDetailsModalOpen(true);
  };

  const handleReviewRma = (rma) => {
    setSelectedRma(rma);
    setReviewModalOpen(true);
  };

  const handleUpdateStatus = (rmaId, newStatus, notes = "") => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setRmaList(prev =>
        prev.map(rma =>
          rma.id === rmaId
            ? { ...rma, status: newStatus }
            : rma
        )
      );
      setLoading(false);
      
      // Close modals
      setDetailsModalOpen(false);
      setReviewModalOpen(false);
      
      alert(`RMA ${rmaId} status updated to ${newStatus}`);
    }, 1000);
  };

  const handleExport = () => {
    // Export functionality
    const csvContent = [
      ["RMA Number", "Customer", "Product", "Type", "Status", "Submitted Date"],
      ...filteredRmas.map(rma => [
        rma.rmaNumber,
        rma.customerName,
        rma.productName,
        rma.rmaType,
        rma.status,
        rma.submittedDate,
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
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      // In real app, fetch from API
      setLoading(false);
    }, 1000);
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
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "warning.light", color: "warning.contrastText" }}>
              <Typography variant="h4">{stats.pending}</Typography>
              <Typography variant="body2">Pending</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "info.light", color: "info.contrastText" }}>
              <Typography variant="h4">{stats.underReview}</Typography>
              <Typography variant="body2">Under Review</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "success.light", color: "success.contrastText" }}>
              <Typography variant="h4">{stats.approved}</Typography>
              <Typography variant="body2">Approved</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: "center", bgcolor: "error.light", color: "error.contrastText" }}>
              <Typography variant="h4">{stats.rejected}</Typography>
              <Typography variant="body2">Rejected</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Actions */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="Search RMA, customer, or product..."
            value={searchQuery}
            onChange={handleSearch}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<FilterList />}
            onClick={() => {/* Will implement filter drawer */}}
          >
            Filters
          </Button>
        </Box>

        {/* Results Info */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredRmas.length} of {stats.total} RMAs
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
        <Grid item xs={12} md={3}>
          <RMAFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* RMA List */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label={`Pending (${stats.pending})`} />
                <Tab label={`Under Review (${stats.underReview})`} />
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
                rmas={filteredRmas}
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
