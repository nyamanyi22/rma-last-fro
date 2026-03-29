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
    IconButton,
    Tooltip,
    Stepper,
    Step,
    StepLabel,
    StepConnector,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import {
    ArrowBack,
    Download,
    Refresh,
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
    Visibility,
    Close,
    InsertDriveFileOutlined,
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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const RMADetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rma, setRma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        loadRmaDetails();
    }, [id]);

    const loadRmaDetails = async () => {
        setLoading(true);
        try {
            const response = await rmaService.getRma(id);
            if (response.success) {
                const rmaData = response.data;
                setRma(rmaData);

                // Dynamically compute active step based on track type
                const isTech = ['warranty', 'repair', 'warranty_repair'].includes(rmaData.rmaType);
                const statusSteps = isTech
                    ? ['pending', 'under_review', 'approved', 'in_repair', 'shipped', 'completed']
                    : ['pending', 'under_review', 'approved', 'shipped', 'completed'];

                const currentIndex = statusSteps.indexOf(rmaData.status);
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
            pending: 'warning',
            under_review: 'info',
            approved: 'success',
            rejected: 'error',
            in_repair: 'secondary',
            shipped: 'primary',
            completed: 'success',
            cancelled: 'default',
        };
        return colors[status] || 'default';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePreviewOpen = async (file) => {
        try {
            setPreviewLoading(true);
            setPreviewFile({ ...file, localUrl: null });
            const downloadEndpoint = `/customer/rma/attachments/${file.id}/download`;
            const blob = await rmaService.getFileBlob(downloadEndpoint);
            const url = URL.createObjectURL(blob);
            setPreviewFile({ ...file, localUrl: url, blob });
        } catch (err) {
            console.error('Failed to load file preview', err);
            alert('Failed to load file for preview');
            setPreviewFile(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handlePreviewClose = () => {
        if (previewFile?.localUrl) {
            URL.revokeObjectURL(previewFile.localUrl);
        }
        setPreviewFile(null);
    };

    const handleDownloadAttachment = (attachment) => {
        rmaService.downloadAttachmentAsBlob(attachment.id, attachment.name || attachment.original_name);
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
                <Alert severity="error" action={
                    <Button color="inherit" size="small" onClick={() => navigate('/client/rma/history')}>Go Back</Button>
                }>
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

    // Dynamic stepper — "In Repair" only shown for Technical Track, "Rejected" replaces rest if status is rejected
    const isTechnical = ['warranty', 'repair', 'warranty_repair'].includes(rma.rmaType);
    let steps = [];

    if (rma.status === 'rejected') {
        steps = [
            { label: 'Submitted', icon: <Pending /> },
            { label: 'Under Review', icon: <History /> },
            { label: 'Rejected', icon: <Cancel />, isError: true },
        ];
    } else {
        steps = [
            { label: 'Submitted', icon: <Pending /> },
            { label: 'Under Review', icon: <History /> },
            { label: 'Approved', icon: <CheckCircle /> },
            ...(isTechnical ? [{ label: 'In Repair', icon: <Build /> }] : []),
            { label: 'Shipped', icon: <LocalShipping /> },
            { label: 'Completed', icon: <CheckCircle /> },
        ];
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/client/rma/history')}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Back to History
                </Button>
                <Tooltip title="Refresh Details">
                    <IconButton
                        onClick={loadRmaDetails}
                        disabled={loading}
                        sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'primary.100', color: 'primary.main' } }}
                    >
                        <Refresh sx={{ animation: loading ? `${spin} 2s linear infinite` : 'none' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Header Card */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontFamily: 'monospace' }}>
                            {rma.rmaNumber}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                                label={rma.statusLabel?.toUpperCase()}
                                sx={{
                                    bgcolor: (theme) => alpha(theme.palette[getStatusColor(rma.status)]?.main || theme.palette.grey[500], 0.15),
                                    color: (theme) => theme.palette[getStatusColor(rma.status)]?.main || theme.palette.grey[700],
                                    fontWeight: 900,
                                    borderRadius: 2,
                                }}
                            />
                            <Chip label={rma.typeLabel} variant="outlined" size="small" sx={{ color: 'white', borderColor: 'white' }} />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">Submitted: {rma.formattedDate}</Typography>
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
                <Stepper activeStep={activeStep} alternativeLabel connector={<ColorlibConnector />}>
                    {steps.map((step, index) => {
                        const isCompleted = index <= activeStep;
                        let bgColor = isCompleted ? 'primary.main' : 'grey.300';
                        if (step.isError && isCompleted) bgColor = 'error.main';

                        return (
                            <Step key={step.label}>
                                <StepLabel
                                    StepIconComponent={() => (
                                        <Avatar sx={{ bgcolor: bgColor, width: 40, height: 40 }}>
                                            {step.icon}
                                        </Avatar>
                                    )}
                                    sx={{
                                        '& .MuiStepLabel-label': {
                                            color: step.isError ? 'error.main' : 'inherit',
                                            fontWeight: step.isError ? 'bold' : 'normal'
                                        }
                                    }}
                                >
                                    {step.label}
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Product Information */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Inventory sx={{ mr: 1 }} /> Product Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Product</Typography>
                                <Typography variant="body1" fontWeight="bold">{rma.productName || 'N/A'}</Typography>
                                {rma.warrantyStatus && rma.requiresWarrantyCheck && (
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip label={rma.warrantyStatus?.text || 'Check Pending'} size="small" color={rma.warrantyStatus?.color || 'warning'} />
                                    </Box>
                                )}
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Serial Number</Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace', mb: 1 }}>{rma.serialNumber || 'Not provided'}</Typography>
                                {rma.warrantyExpiryDate && rma.requiresWarrantyCheck && (
                                     <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                         <CalendarToday fontSize="small" /> Valid Until: {rma.formattedExpiryDate || formatDate(rma.warrantyExpiryDate)}
                                     </Typography>
                                )}
                            </Grid>
                            <Grid size={12}><Divider sx={{ my: 2 }} /></Grid>
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Issue Description</Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, borderStyle: 'dashed' }}>
                                    <Typography variant="body1">{rma.issueDescription || 'No description provided'}</Typography>
                                </Paper>
                            </Grid>
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Reason</Typography>
                                <Chip label={rma.reasonLabel} size="small" color="primary" variant="outlined" />
                            </Grid>

                            {/* Attachments */}
                            {rma.attachments && rma.attachments.length > 0 && (
                                <Grid size={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AttachFile fontSize="small" /> Attachments ({rma.attachments.length})
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                                        {rma.attachments.map((file, index) => {
                                            const fileUrl = file.thumbnail || file.preview || file.url || 'https://via.placeholder.com/100?text=File';
                                            return (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        width: 100, height: 100, borderRadius: 2,
                                                        overflow: 'hidden', border: '1px solid', borderColor: 'divider',
                                                        position: 'relative', cursor: 'pointer',
                                                        '&:hover .overlay': { opacity: 1 }
                                                    }}
                                                    onClick={() => handlePreviewOpen(file)}
                                                >
                                                    {file.isImage ? (
                                                        <Box component="img" src={fileUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                                                            <Description color="action" />
                                                        </Box>
                                                    )}
                                                    <Box className="overlay" sx={{
                                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                        bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s'
                                                    }}>
                                                        <Visibility sx={{ color: 'white' }} />
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute', bottom: 4, right: 4,
                                                            bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }, zIndex: 2
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); handleDownloadAttachment(file); }}
                                                    >
                                                        <Download sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    {/* Left side content ends here, warranty panel removed since it's now in product info */}
                </Grid>

                {/* Right Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Status Card */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Current Status</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Status</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StatusDot color={getStatusColor(rma.status)} />
                                <Typography variant="h6">{rma.statusLabel}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Priority</Typography>
                            <Chip label={rma.priorityLabel} color={rma.priorityColor} size="small" />
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>Last Updated</Typography>
                            <Typography variant="body2">{formatDate(rma.updatedAt)}</Typography>
                        </Box>

                        {/* Rejection Feedback — only visible when rejected */}
                        {rma.status === 'rejected' && (rma.rejectionReason || rma.customerMessage) && (
                            <Box sx={{ mt: 3 }}>
                                <Alert
                                    severity="error"
                                    variant="filled"
                                    icon={<Cancel />}
                                    sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                                        Rejection Feedback
                                    </Typography>
                                    {rma.rejectionReason && (
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            Category: {rma.rejectionReason}
                                        </Typography>
                                    )}
                                    {rma.customerMessage && (
                                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 400 }}>
                                            Reason: {rma.customerMessage}
                                        </Typography>
                                    )}
                                </Alert>
                            </Box>
                        )}
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
                                    <Typography variant="body1" fontWeight="medium">{rma.contactName}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Email sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1" fontWeight="medium">{rma.contactEmail}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                                    <Typography variant="body1" fontWeight="medium">{rma.contactPhone}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
                                    <Typography variant="body1" fontWeight="medium">{rma.shippingAddress}</Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
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
                                    <TimelineDot color="primary"><History fontSize="small" /></TimelineDot>
                                    {index < rma.statusHistory.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">{history.status}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {formatDate(history.created_at)}
                                        </Typography>
                                        {history.notes && (
                                            <Typography variant="body2" sx={{ mt: 1 }}>{history.notes}</Typography>
                                        )}
                                    </Paper>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Paper>
            )}

            {/* Attachment Preview Modal */}
            <Dialog
                open={!!previewFile}
                onClose={handlePreviewClose}
                maxWidth="md"
                fullWidth
                slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.6)' } } }}
                PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)' } }}
            >
                {previewFile && (
                    <>
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 800 }}>
                                {previewFile.name || previewFile.original_name || 'Document Preview'}
                            </Typography>
                            <IconButton
                                onClick={handlePreviewClose}
                                sx={{ bgcolor: alpha('#000', 0.05), '&:hover': { bgcolor: alpha('#000', 0.1) }, color: 'text.primary' }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0, bgcolor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '65vh', height: '65vh', overflow: 'auto' }}>
                            {previewLoading ? (
                                <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <CircularProgress size={48} sx={{ mb: 2 }} />
                                    <Typography variant="body2" color="text.secondary">Fetching secure preview...</Typography>
                                </Box>
                            ) : previewFile.localUrl ? (
                                previewFile.mime_type === 'application/pdf' ? (
                                    <object data={previewFile.localUrl} type="application/pdf" width="100%" height="100%" title="PDF Preview">
                                        <Typography p={4} align="center">Failed to load PDF. Please download the file to view it.</Typography>
                                    </object>
                                ) : previewFile.isImage ? (
                                    <Box component="img" src={previewFile.localUrl} alt={previewFile.name || previewFile.original_name} sx={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                                ) : (
                                    <Box sx={{ p: 8, textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <InsertDriveFileOutlined sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>Preview not available</Typography>
                                        <Typography variant="body2" color="text.secondary">Please download the file to view its contents.</Typography>
                                    </Box>
                                )
                            ) : null}
                        </DialogContent>

                        <DialogActions sx={{ p: 3, backgroundColor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={handlePreviewClose} sx={{ fontWeight: 700, px: 4, py: 1, color: '#6366f1', fontSize: '1.05rem', textTransform: 'none' }}>
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Download />}
                                onClick={() => {
                                    const url = previewFile.localUrl || previewFile.url;
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = previewFile.name || previewFile.original_name || 'download';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                                sx={{ borderRadius: 3, fontWeight: 700, px: 4, py: 1, textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)', '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.5)' } }}
                            >
                                Download
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default RMADetails;