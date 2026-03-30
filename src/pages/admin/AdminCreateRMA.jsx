import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    Avatar,
    Chip,
    Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PersonOutline, ArrowBack } from "@mui/icons-material";
import RMAFormStep1 from "../../components/client/rma/RMAFormStep1";
import RMAFormStep2 from "../../components/client/rma/RMAFormStep2";
import RMAFormStep3 from "../../components/client/rma/RMAFormStep3";
import rmaService from "../../services/api/rmaService";
import CustomerService from "../../services/api/customerService";

const ACCENT = "#6366f1";

const steps = [
    "Select RMA Type & Product",
    "Describe Issue & Upload Proof",
    "Review & Submit",
];

const AdminCreateRMA = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const customerId = searchParams.get("customerId");

    const [customer, setCustomer] = useState(null);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [customerError, setCustomerError] = useState("");

    const [formData, setFormData] = useState({
        rmaType: "simple_return",
        productId: "",
        product: null,
        saleId: "",
        serialNumber: "",
        receiptNumber: "",
        reason: "",
        issueDescription: "",
        attachments: [],
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        shippingAddress: "",
        policyAgreed: true, // Waived for admin-initiated RMAs
    });

    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch the customer by ID to pre-fill contact info
    useEffect(() => {
        if (!customerId) return;
        const fetchCustomer = async () => {
            setCustomerLoading(true);
            setCustomerError("");
            try {
                const response = await CustomerService.getCustomer(customerId);
                if (response.success) {
                    const c = response.data;
                    setCustomer(c);
                    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
                    const address = [c.address, c.city, c.country].filter(Boolean).join(", ");
                    setFormData((prev) => ({
                        ...prev,
                        contactName: fullName,
                        contactEmail: c.email || "",
                        contactPhone: c.phone || "",
                        shippingAddress: address,
                    }));
                } else {
                    setCustomerError("Could not load customer information.");
                }
            } catch (err) {
                setCustomerError(err.message || "Failed to load customer.");
            } finally {
                setCustomerLoading(false);
            }
        };
        fetchCustomer();
    }, [customerId]);

    const handleNext = () => {
        setErrors({});
        setShowErrorToast(false);
        const newErrors = {};

        if (activeStep === 0) {
            if (!formData.productId) newErrors.productId = "Please select a product";
            if (formData.rmaType === "warranty_repair" && !formData.saleId)
                newErrors.saleId = "Please select the purchase for warranty/repair claim";
        }
        if (activeStep === 1) {
            if (!formData.reason) newErrors.reason = "Please select a reason";
            if (!formData.issueDescription || formData.issueDescription.length < 10)
                newErrors.issueDescription = "Please describe the issue in detail (minimum 10 characters)";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setShowErrorToast(true);
            return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        setErrors({});
        setShowErrorToast(false);
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErr = { ...prev };
                delete newErr[field];
                return newErr;
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        setShowErrorToast(false);
        try {
            const response = await rmaService.adminCreateRma({
                rmaType: formData.rmaType,
                productId: formData.productId,
                saleId: formData.saleId || null,
                reason: formData.reason,
                issueDescription: formData.issueDescription,
                serialNumber: formData.serialNumber,
                receiptNumber: formData.receiptNumber,
                attachments: formData.attachments,
                contactName: formData.contactName,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                shippingAddress: formData.shippingAddress,
                customerId: customerId || undefined,
            });
            setSuccess(`RMA created successfully! Number: ${response.data?.rmaNumber || "N/A"}`);
            setTimeout(() => navigate("/admin/rma"), 3000);
        } catch (err) {
            if (err.errors) setErrors(err.errors);
            setShowErrorToast(true);
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <RMAFormStep1 formData={formData} onChange={handleFormChange} errors={errors} />;
            case 1:
                return (
                    <RMAFormStep2
                        formData={formData}
                        onChange={handleFormChange}
                        rmaType={formData.rmaType}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <RMAFormStep3
                        formData={formData}
                        rmaType={formData.rmaType}
                        onChange={handleFormChange}
                        errors={errors}
                    />
                );
            default:
                return null;
        }
    };

    const getInitials = (c) =>
        c ? `${(c.first_name || "")[0] || ""}${(c.last_name || "")[0] || ""}`.toUpperCase() || "?" : "?";

    return (
        <Box>
            {/* Page Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/admin/customers")}
                    sx={{ borderRadius: 2, fontWeight: 600, color: "text.secondary" }}
                >
                    Back to Customers
                </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={3} spacing={2}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        Create RMA for Customer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Submitting a return or warranty request on behalf of a customer.
                    </Typography>
                </Box>

                {/* Customer badge */}
                {customerLoading ? (
                    <CircularProgress size={24} />
                ) : customer ? (
                    <Paper
                        elevation={0}
                        sx={{
                            px: 2.5,
                            py: 1.5,
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: alpha(ACCENT, 0.25),
                            bgcolor: alpha(ACCENT, 0.04),
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: alpha(ACCENT, 0.15),
                                color: ACCENT,
                                fontWeight: 700,
                                fontSize: "0.85rem",
                            }}
                        >
                            {getInitials(customer)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2, color: "#0f172a" }}>
                                {`${customer.first_name || ""} ${customer.last_name || ""}`.trim()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {customer.email}
                            </Typography>
                        </Box>
                        <Chip
                            label="Selected Customer"
                            size="small"
                            sx={{
                                ml: 1,
                                bgcolor: alpha(ACCENT, 0.1),
                                color: ACCENT,
                                fontWeight: 700,
                                fontSize: "0.7rem",
                            }}
                        />
                    </Paper>
                ) : customerError ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        {customerError}
                    </Alert>
                ) : null}
            </Stack>

            <Paper sx={{ p: 4, borderRadius: 4 }}>
                {/* Toast notifications */}
                <Snackbar
                    open={showErrorToast}
                    autoHideDuration={6000}
                    onClose={() => setShowErrorToast(false)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setShowErrorToast(false)}
                        severity="error"
                        sx={{ width: "100%", borderRadius: 2, fontWeight: 600, boxShadow: 3 }}
                    >
                        There are validation errors. Please check the highlighted fields.
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!success}
                    autoHideDuration={6000}
                    onClose={() => setSuccess("")}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSuccess("")}
                        severity="success"
                        sx={{ width: "100%", borderRadius: 2, fontWeight: 600, boxShadow: 3 }}
                    >
                        {success}
                    </Alert>
                </Snackbar>

                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ pt: 1, pb: 5 }} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step Content */}
                <Box sx={{ mt: 2 }}>{getStepContent(activeStep)}</Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button
                        disabled={activeStep === 0 || loading}
                        onClick={handleBack}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                        disabled={
                            loading ||
                            (activeStep === steps.length - 1 && !formData.policyAgreed)
                        }
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 4,
                            bgcolor: ACCENT,
                            "&:hover": { bgcolor: "#4f46e5" },
                        }}
                    >
                        {loading
                            ? "Processing..."
                            : activeStep === steps.length - 1
                            ? "Submit RMA"
                            : "Next Step"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminCreateRMA;
