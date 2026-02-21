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
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "in_repair", label: "In Repair" },
    { value: "completed", label: "Completed" },
  ];

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "return", label: "Simple Return" },
    { value: "warranty", label: "Warranty/Repair" },
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
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6">Filters</Typography>
        
        {isFiltered() && (
          <Chip
            label="Filtered"
            color="primary"
            size="small"
            sx={{ ml: "auto" }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

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
        variant="outlined"
        startIcon={<ClearAll />}
        onClick={onClearFilters}
        disabled={!isFiltered()}
      >
        Clear All Filters
      </Button>

      {/* Active Filters Display */}
      {isFiltered() && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {filters.status !== "all" && (
              <Chip
                label={`Status: ${filters.status}`}
                size="small"
                onDelete={() => handleChange("status", "all")}
              />
            )}
            {filters.rmaType !== "all" && (
              <Chip
                label={`Type: ${filters.rmaType}`}
                size="small"
                onDelete={() => handleChange("rmaType", "all")}
              />
            )}
            {filters.priority !== "all" && (
              <Chip
                label={`Priority: ${filters.priority}`}
                size="small"
                onDelete={() => handleChange("priority", "all")}
              />
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RMAFilters;
