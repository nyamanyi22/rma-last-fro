import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Divider,
    Avatar,
    Stack,
    Card,
    CardContent,
    LinearProgress,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Download,
    Share,
    Print,
    History,
    Inventory,
    Receipt,
    LocalShipping,
    CheckCircle,
    Pending,
    Cancel,
    Build,
    Description,
    AttachFile,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    Person,
    Visibility
} from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import rmaService from '../../services/api/rmaService';

// Styled components
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`& .${StepConnector.line}`]: {
        height: 3,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
}));

const StatusDot = styled('span')(({ color }) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    marginRight: 8,
}));

const RMADetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rma, setRma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        loadRmaDetails();
    }, [id]);

    const loadRmaDetails = async () => {
        try {
            const response = await rmaService.getRma(id);
            if (response.success) {
                setRma(response.data);

                // Calculate active step based on status
                const statusSteps = ['pending', 'under_review', 'approved', 'in_repair', 'ready_for_shipment', 'shipped', 'delivered', 'completed'];
                const currentIndex = statusSteps.indexOf(response.data.status);
                setActiveStep(currentIndex !== -1 ? currentIndex : 0);
            } else {
                setError('Failed to load RMA details');
            }
        } catch (err) {
            setError(err.message || 'Failed to load RMA details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'warning',
            'under_review': 'info',
            'approved': 'success',
            'rejected': 'error',
            'in_repair': 'secondary',
            'repaired': 'success',
            'shipped': 'primary',
            'delivered': 'success',
            'completed': 'success',
            'cancelled': 'error'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Pending />;
            case 'approved': return <CheckCircle />;
            case 'rejected': return <Cancel />;
            case 'shipped': return <LocalShipping />;
            case 'delivered': return <CheckCircle />;
            case 'completed': return <CheckCircle />;
            case 'cancelled': return <Cancel />;
            default: return <Pending />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const handleDownloadAttachment = (attachment) => {
        if (attachment?.id) {
            rmaService.downloadAttachment(attachment.id);
        } else if (typeof attachment === 'string') {
            // Fallback for legacy string paths if any
            window.open(attachment, '_blank');
        }
    };

    const handleViewAttachment = (attachment) => {
        if (attachment.isImage && attachment.url) {
            setPreviewImage(attachment.url);
        } else if (attachment.url) {
            window.open(attachment.url, '_blank');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Loading RMA details...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/client/rma/history')}>
                            Go Back
                        </Button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!rma) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="info">RMA not found</Alert>
            </Container>
        );
    }

    // Timeline steps for RMA progress
    const steps = [
        { label: 'Submitted', icon: <Pending /> },
        { label: 'Under Review', icon: <History /> },
        { label: 'Approved', icon: <CheckCircle /> },
        { label: 'In Repair', icon: <Build /> },
        { label: 'Shipped', icon: <LocalShipping /> },
        { label: 'Delivered', icon: <CheckCircle /> },
        { label: 'Completed', icon: <CheckCircle /> }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header with back button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/client/rma/history')}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Back to History
                </Button>
                <Box>
                    <Tooltip title="Share">
                        <IconButton sx={{ mr: 1 }}>
                            <Share />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Print">
                        <IconButton>
                            <Print />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Header Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'monospace' }}>
                            {rma.rmaNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                                label={rma.statusLabel?.toUpperCase()}
                                color={getStatusColor(rma.status)}
                                size="small"
                                sx={{ fontWeight: 'bold', color: 'white' }}
                            />
                            <Chip
                                label={rma.typeLabel}
                                variant="outlined"
                                size="small"
                                sx={{ color: 'white', borderColor: 'white' }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                    Submitted: {rma.formattedDate}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', opacity: 0.3 }}>
                            #{rma.id}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Progress Stepper */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <History sx={{ mr: 1 }} /> Progress Timeline
                </Typography>
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    connector={<ColorlibConnector />}
                >
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                StepIconComponent={() => (
                                    <Avatar
                                        sx={{
                                            bgcolor: index <= activeStep ? 'primary.main' : 'grey.300',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        {step.icon}
                                    </Avatar>
                                )}
                            >
                                {step.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column - Product & Issue Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Product Information */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Inventory sx={{ mr: 1 }} /> Product Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Product
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {rma.productName || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Serial Number
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {rma.serialNumber || 'Not provided'}
                                </Typography>
                            </Grid>
                            <Grid size={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Issue Description
                                </Typography>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        bgcolor: 'grey.50',
                                        borderRadius: 2,
                                        borderStyle: 'dashed'
                                    }}
                                >
                                    <Typography variant="body1">
                                        {rma.issueDescription || 'No description provided'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Reason
                                </Typography>
                                <Chip
                                    label={rma.reasonLabel}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Warranty Information (if applicable) */}
                    {rma.requiresWarrantyCheck && (
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <Receipt sx={{ mr: 1 }} /> Warranty Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Warranty Status
                                    </Typography>
                                    <Chip
                                        label={rma.warrantyStatus?.text || 'Pending Check'}
                                        color={rma.warrantyStatus?.color || 'warning'}
                                    />
                                </Grid>
                                {rma.warrantyExpiryDate && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Expiry Date
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {rma.formattedExpiryDate || formatDate(rma.warrantyExpiryDate)}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    )}

                    {/* Attachments */}
                    {rma.attachments && rma.attachments.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                                <AttachFile sx={{ mr: 1 }} /> Attachments ({rma.attachments.length})
                            </Typography>
                            <Grid container spacing={2}>
                                {rma.attachments.map((file, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                        <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {file.isImage && (file.thumbnail || file.url) && (
                                                <Box
                                                    component="img"
                                                    src={file.thumbnail || file.url}
                                                    alt={file.name}
                                                    sx={{
                                                        height: 140,
                                                        width: '100%',
                                                        objectFit: 'cover',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider'
                                                    }}
                                                    onClick={() => handleViewAttachment(file)}
                                                />
                                            )}
                                            {!file.isImage && (
                                                <Box
                                                    sx={{
                                                        height: 140,
                                                        width: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'grey.100',
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider'
                                                    }}
                                                >
                                                    <Description sx={{ fontSize: 48, color: 'text.secondary' }} />
                                                </Box>
                                            )}
                                            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 'bold' }}>
                                                        {file.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {file.formattedSize || 'N/A'}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        {file.url && (
                                                            <Tooltip title="View">
                                                                <IconButton size="small" onClick={() => handleViewAttachment(file)} color="primary">
                                                                    <Visibility fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Download">
                                                            <IconButton size="small" onClick={() => handleDownloadAttachment(file)}>
                                                                <Download fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    )}
                </Grid>

                {/* Right Column - Status & Contact Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Status Card */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Current Status
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Status
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StatusDot color={getStatusColor(rma.status)} />
                                <Typography variant="h6">
                                    {rma.statusLabel}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Priority
                            </Typography>
                            <Chip
                                label={rma.priorityLabel}
                                color={rma.priorityColor}
                                size="small"
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Last Updated
                            </Typography>
                            <Typography variant="body2">
                                {formatDate(rma.updatedAt)}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Contact Information */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Person sx={{ mr: 1 }} /> Contact Information
                        </Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Name</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {rma.contactName}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Email sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {rma.contactEmail}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {rma.contactPhone}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
                                    <Typography variant="body1" fontWeight="medium">
                                        {rma.shippingAddress}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Admin Notes (if any) */}
                    {rma.adminNotes && (
                        <Paper sx={{ p: 3, borderRadius: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Admin Notes
                            </Typography>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: 'info.50',
                                    borderRadius: 2
                                }}
                            >
                                <Typography variant="body2">
                                    {rma.adminNotes}
                                </Typography>
                            </Paper>
                        </Paper>
                    )}
                </Grid>
            </Grid>

            {/* Status History Timeline */}
            {rma.statusHistory && rma.statusHistory.length > 0 && (
                <Paper sx={{ p: 3, mt: 3, borderRadius: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <History sx={{ mr: 1 }} /> Status History
                    </Typography>
                    <Timeline position="alternate">
                        {rma.statusHistory.map((history, index) => (
                            <TimelineItem key={index}>
                                <TimelineSeparator>
                                    <TimelineDot color="primary">
                                        <History fontSize="small" />
                                    </TimelineDot>
                                    {index < rma.statusHistory.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {history.status}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {formatDate(history.created_at)}
                                        </Typography>
                                        {history.notes && (
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {history.notes}
                                            </Typography>
                                        )}
                                    </Paper>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Paper>
            )}
            {/* Image Preview Dialog */}
            <Dialog
                open={!!previewImage}
                onClose={() => setPreviewImage(null)}
                maxWidth="lg"
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Image Preview
                    <IconButton onClick={() => setPreviewImage(null)} size="small">
                        <Cancel />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    {previewImage && (
                        <Box
                            component="img"
                            src={previewImage}
                            alt="Preview"
                            sx={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                maxHeight: '80vh'
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewImage(null)}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<Download />}
                        onClick={() => {
                            const file = rma.attachments.find(a => a.url === previewImage);
                            if (file) handleDownloadAttachment(file);
                        }}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RMADetails;