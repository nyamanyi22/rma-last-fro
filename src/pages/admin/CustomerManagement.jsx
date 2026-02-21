import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    InputAdornment,
    Button,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    Search,
    PersonAdd,
    FilterList,
    GetApp
} from '@mui/icons-material';
import CustomerTable from '../../components/admin/customer-management/CustomerTable';
import CustomerDetails from '../../components/admin/customer-management/CustomerDetails';

// Mock Data
const MOCK_CUSTOMERS = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 890", role: "customer", status: "active", joinedDate: "2023-11-15", address: "123 Main St, New York, NY" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 987 654 321", role: "customer", status: "active", joinedDate: "2023-12-01", address: "456 Oak Ave, Los Angeles, CA" },
    { id: 3, name: "Robert Johnson", email: "robert@example.com", phone: "", role: "customer", status: "banned", joinedDate: "2024-01-10", address: "789 Pine Rd, Chicago, IL" },
    { id: 4, name: "Alice Brown", email: "alice@example.com", phone: "+1 555 123 456", role: "customer", status: "active", joinedDate: "2024-02-05", address: "" },
    { id: 5, name: "Charlie Wilson", email: "charlie@example.com", phone: "+1 555 987 654", role: "admin", status: "active", joinedDate: "2023-10-20", address: "Admin HQ" },
];

const CustomerManagement = () => {
    const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // Filter logic
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleViewDetails = (customer) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleToggleStatus = (id) => {
        if (window.confirm("Are you sure you want to change this user's status?")) {
            setCustomers(customers.map(c =>
                c.id === id
                    ? { ...c, status: c.status === 'active' ? 'banned' : 'active' }
                    : c
            ));
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Customer Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your customer base, view profiles, and handle account statuses.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<GetApp />}>
                        Export
                    </Button>
                    <Button variant="contained" startIcon={<PersonAdd />}>
                        Add Customer
                    </Button>
                </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Total Customers</Typography>
                            <Typography variant="h4" fontWeight="bold">{customers.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Active Users</Typography>
                            <Typography variant="h4" fontWeight="bold" color="success.main">
                                {customers.filter(c => c.status === 'active').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>New This Month</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary.main">
                                2
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Content */}
            <Paper sx={{ p: 3 }}>
                {/* Toolbar */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ flexGrow: 1, maxWidth: 400 }}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button startIcon={<FilterList />} variant="outlined">
                        Filters
                    </Button>
                </Box>

                {/* Table */}
                <CustomerTable
                    customers={filteredCustomers}
                    onViewDetails={handleViewDetails}
                    onToggleStatus={handleToggleStatus}
                />
            </Paper>

            {/* Details Dialog */}
            <CustomerDetails
                open={detailsOpen}
                customer={selectedCustomer}
                onClose={() => setDetailsOpen(false)}
            />
        </Container>
    );
};

export default CustomerManagement;
