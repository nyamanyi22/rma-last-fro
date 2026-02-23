import React, { useState, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    LinearProgress,
    Alert,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton,
    CircularProgress,
} from "@mui/material";
import {
    CloudUpload,
    FilePresent,
    CheckCircle,
    Error,
    Close,
    Download,
} from "@mui/icons-material";
import SaleService from "../../../services/api/saleService";

const ImportSales = ({ onImportComplete, onCancel }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                setError("Please select a valid CSV file.");
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError("");
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setUploading(true);
        setProgress(0);
        setError("");

        try {
            const response = await SaleService.importSales(file, (percent) => {
                setProgress(percent);
            });

            if (response.success) {
                setResult({
                    success: true,
                    message: response.message || "Import completed successfully",
                    count: response.data?.imported_count || 0,
                    errors: response.data?.errors || [],
                });
                if (onImportComplete) {
                    onImportComplete();
                }
            } else {
                throw new Error(response.message || "Import failed");
            }
        } catch (err) {
            setError(err.message || "An error occurred during import");
            setResult({
                success: false,
                message: err.message || "Import failed",
            });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ["order_number", "invoice_number", "customer_name", "customer_email", "product_sku", "sale_date", "quantity"];
        const rows = [
            ["ORD-001", "INV-2023-001", "John Doe", "john@example.com", "SKU-LAPTOP-01", "2023-10-15", "1"],
            ["ORD-002", "INV-2023-002", "Jane Smith", "jane@example.com", "SKU-MONITOR-05", "2023-10-16", "2"],
        ];

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sales_import_template.csv";
        a.click();
    };

    const clearFile = () => {
        setFile(null);
        setResult(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Upload a CSV file to bulk import sales records. Ensure your file follows the required format.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadTemplate}
                    size="small"
                >
                    Download Template
                </Button>
            </Box>

            {!file && !result ? (
                <Paper
                    sx={{
                        p: 4,
                        border: "2px dashed",
                        borderColor: error ? "error.main" : "grey.300",
                        bgcolor: "grey.50",
                        textAlign: "center",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "grey.100" },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                    <Typography variant="h6">Click to upload CSV</Typography>
                    <Typography variant="body2" color="text.secondary">
                        or drag and drop your file here
                    </Typography>
                    <input
                        type="file"
                        accept=".csv"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </Paper>
            ) : (
                <Paper sx={{ p: 2, bgcolor: "grey.50", mb: 3, position: "relative" }}>
                    {!uploading && !result && (
                        <IconButton
                            size="small"
                            sx={{ position: "absolute", top: 8, right: 8 }}
                            onClick={clearFile}
                        >
                            <Close />
                        </IconButton>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <FilePresent sx={{ fontSize: 32, color: "primary.main" }} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {file?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {(file?.size / 1024).toFixed(2)} KB
                            </Typography>
                        </Box>
                    </Box>

                    {uploading && (
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2">Uploading...</Typography>
                                <Typography variant="body2">{progress}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} />
                        </Box>
                    )}
                </Paper>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {result && (
                <Box sx={{ mb: 3 }}>
                    {result.success ? (
                        <Alert severity="success" icon={<CheckCircle />}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Import Successful!
                            </Typography>
                            {result.count} sales records have been imported.
                        </Alert>
                    ) : (
                        <Alert severity="error" icon={<Error />}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Import Failed
                            </Typography>
                            {result.message}
                        </Alert>
                    )}

                    {result.errors && result.errors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                                Import Errors ({result.errors.length}):
                            </Typography>
                            <Paper sx={{ maxHeight: 200, overflow: "auto", p: 1, bgcolor: "error.light" }}>
                                <List size="small" dense>
                                    {result.errors.map((err, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`Row ${err.row}: ${err.message} `}
                                                primaryTypographyProps={{ variant: "caption", color: "error.contrastText" }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                <Button onClick={onCancel} disabled={uploading}>
                    {result ? "Close" : "Cancel"}
                </Button>
                {!result && (
                    <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                    >
                        {uploading ? "Importing..." : "Start Import"}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default ImportSales;
