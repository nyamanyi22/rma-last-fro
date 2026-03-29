import React from "react";
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  FilterList,
  ClearAll,
} from "@mui/icons-material";

const RMAFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "In Progress" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "in_repair", label: "In Repair" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "simple_return", label: "Simple Return" },
    { value: "warranty_repair", label: "Warranty/Repair" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const handleChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const isFiltered = () => {
    return (
      filters.status !== "all" ||
      filters.rmaType !== "all" ||
      filters.priority !== "all" ||
      filters.dateRange !== "all"
    );
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #edf2f7', backgroundColor: '#fcfcfc' }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterList sx={{ mr: 1, color: "#1e293b" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>Filters</Typography>

        {isFiltered() && (
          <Chip
            label="Active"
            color="primary"
            size="small"
            sx={{ ml: "auto", fontWeight: 700, height: 20, fontSize: '0.65rem', borderRadius: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 3, opacity: 0.6 }} />

      {/* Status Filter */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          label="Status"
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* RMA Type Filter */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>RMA Type</InputLabel>
        <Select
          value={filters.rmaType}
          onChange={(e) => handleChange("rmaType", e.target.value)}
          label="RMA Type"
        >
          {typeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Priority Filter */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          label="Priority"
        >
          {priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Range Filter */}
      <FormControl fullWidth size="small" sx={{ mb: 3 }}>
        <InputLabel>Date Range</InputLabel>
        <Select
          value={filters.dateRange}
          onChange={(e) => handleChange("dateRange", e.target.value)}
          label="Date Range"
        >
          {dateOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filters.dateRange === "custom" && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="From Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            size="small"
            label="To Date"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      )}

      <Button
        fullWidth
        variant="text"
        startIcon={<ClearAll />}
        onClick={onClearFilters}
        disabled={!isFiltered()}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          color: "#64748b",
          '&:hover': { color: "#ef4444", backgroundColor: "#fef2f2" }
        }}
      >
        Clear All Filters
      </Button>

      {/* Active Filters Display */}
      {isFiltered() && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: "#f8fafc", borderRadius: 2 }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
            Active Applied:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {filters.status !== "all" && (
              <Chip
                label={`Status: ${filters.status}`}
                size="small"
                variant="outlined"
                onDelete={() => handleChange("status", "all")}
                sx={{ borderRadius: 1, fontWeight: 500, backgroundColor: 'white' }}
              />
            )}
            {filters.rmaType !== "all" && (
              <Chip
                label={`Type: ${filters.rmaType}`}
                size="small"
                variant="outlined"
                onDelete={() => handleChange("rmaType", "all")}
                sx={{ borderRadius: 1, fontWeight: 500, backgroundColor: 'white' }}
              />
            )}
            {filters.priority !== "all" && (
              <Chip
                label={`Priority: ${filters.priority}`}
                size="small"
                variant="outlined"
                onDelete={() => handleChange("priority", "all")}
                sx={{ borderRadius: 1, fontWeight: 500, backgroundColor: 'white' }}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RMAFilters;
