import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    AlertTitle,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    CloudUploadOutlined,
    CheckCircleOutline,
    ErrorOutline,
    WarningAmberOutlined,
    InsertDriveFileOutlined,
    FileDownloadOutlined,
} from "@mui/icons-material";
import Papa from "papaparse";
import SaleService from "../../../services/api/saleService";

const ImportSales = ({ onImportComplete, onCancel }) => {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [preview, setPreview] = useState([]);
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef();

    const requiredFields = [
        "invoice_number",
        "customer_email",
        "product_id",
        "sale_date",
        "amount",
    ];

    const optionalFields = [
        "customer_name",
        "quantity",
        "serial_number",
        "warranty_months",
        "payment_method",
        "notes",
    ];

    const validateHeaders = (headers) => {
        const missing = requiredFields.filter(
            (field) => !headers.includes(field)
        );
        return {
            valid: missing.length === 0,
            missing,
        };
    };

    const validateRow = (row, index) => {
        const rowErrors = [];

        // Check required fields
        requiredFields.forEach((field) => {
            if (!row[field] || row[field].toString().trim() === "") {
                rowErrors.push(`Row ${index + 1}: ${field} is required`);
            }
        });

        // Validate email format
        if (row.customer_email && !isValidEmail(row.customer_email)) {
            rowErrors.push(`Row ${index + 1}: Invalid email format`);
        }

        // Validate date format
        if (row.sale_date && !isValidDate(row.sale_date)) {
            rowErrors.push(`Row ${index + 1}: Invalid date format (use YYYY-MM-DD)`);
        }

        // Validate amount is numeric
        if (row.amount && isNaN(parseFloat(row.amount))) {
            rowErrors.push(`Row ${index + 1}: Amount must be a number`);
        }

        // Validate product_id is numeric
        if (row.product_id && isNaN(parseInt(row.product_id))) {
            rowErrors.push(`Row ${index + 1}: Product ID must be a number`);
        }

        // Validate quantity if provided
        if (row.quantity && isNaN(parseInt(row.quantity))) {
            rowErrors.push(`Row ${index + 1}: Quantity must be a number`);
        }

        // Validate warranty_months if provided
        if (row.warranty_months && isNaN(parseInt(row.warranty_months))) {
            rowErrors.push(`Row ${index + 1}: Warranty months must be a number`);
        }

        return rowErrors;
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidDate = (date) => {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d) && date.match(/^\d{4}-\d{2}-\d{2}$/);
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        parseCSV(selectedFile);
    };

    const parseCSV = (file) => {
        setParsing(true);
        setErrors([]);
        setWarnings([]);
        setPreview([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const { data, meta } = results;
                const headers = meta.fields || [];

                // Validate headers
                const headerValidation = validateHeaders(headers);
                if (!headerValidation.valid) {
                    setErrors([
                        `Missing required columns: ${headerValidation.missing.join(", ")}`,
                    ]);
                    setParsing(false);
                    return;
                }

                // Check for unknown columns (optional fields are allowed)
                const unknownColumns = headers.filter(
                    (h) => ![...requiredFields, ...optionalFields].includes(h)
                );
                if (unknownColumns.length > 0) {
                    setWarnings([
                        `Unknown columns will be ignored: ${unknownColumns.join(", ")}`,
                    ]);
                }

                // Validate each row
                const rowErrors = [];
                data.forEach((row, index) => {
                    const rowValidationErrors = validateRow(row, index);
                    rowErrors.push(...rowValidationErrors);
                });

                if (rowErrors.length > 0) {
                    setErrors(rowErrors);
                    setParsing(false);
                    return;
                }

                // Show preview (first 5 rows)
                setPreview(data.slice(0, 5));
                setParsing(false);
            },
            error: (error) => {
                setErrors([`Failed to parse CSV: ${error.message}`]);
                setParsing(false);
            },
        });
    };

    const handleImport = async () => {
        if (!file) {
            setErrors(['Please select a file first']);
            return;
        }

        setImporting(true);
        setErrors([]);
        setImportResult(null);

        try {
            const fileObj = new File([file], file.name, { type: file.type });
            const response = await SaleService.importSales(fileObj);

            if (response.success) {
                setImportResult({
                    success: true,
                    message: response.message || "Archive synchronization complete",
                    imported: response.imported || [],
                    failed: response.failed || [],
                    duplicates: response.duplicates || [],
                });

                if (response.failed?.length === 0 && response.duplicates?.length === 0) {
                    setTimeout(() => {
                        onImportComplete();
                    }, 2000);
                }
            } else {
                setErrors([response.message || "Batch ingestion failure"]);
            }
        } catch (error) {
            console.error("Import error:", error);
            setErrors([error.message || "An unexpected error occurred during batch ingestion"]);
        } finally {
            setImporting(false);
        }
    };

    const downloadSampleCSV = () => {
        const headers = [...requiredFields, ...optionalFields].join(",");
        const sampleRow = [
            "INV-1001", "customer@example.com", "1", "2024-01-15", "1299.99",
            "John Doe", "1", "SN123456", "12", "Credit Card", "Sample record"
        ].join(",");

        const csvContent = `${headers}\n${sampleRow}`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sales_ingestion_blueprint.csv";
        link.click();
    };

    return (
        <Stack spacing={3} sx={{ mt: 1 }}>
            {!importResult ? (
                <>
                    {/* Upload Zone */}
                    <Box
                        sx={{
                            border: '2px dashed',
                            borderColor: file ? 'primary.main' : 'divider',
                            borderRadius: 4,
                            p: 6,
                            textAlign: 'center',
                            bgcolor: file ? alpha('#1976d2', 0.02) : alpha('#f5f5f5', 0.5),
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#1976d2', 0.04) }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <CloudUploadOutlined sx={{ fontSize: 48, color: file ? 'primary.main' : 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {file ? file.name : "Target Archive Selection"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click to pin-point or drop the CSV ledger here
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
                            Mandatory fields: {requiredFields.join(", ")}
                        </Typography>
                    </Box>

                    {/* Template Guide */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: alpha('#ed6c02', 0.05),
                            border: '1px solid',
                            borderColor: alpha('#ed6c02', 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <FileDownloadOutlined sx={{ color: '#ed6c02' }} />
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Requirement Blueprint</Typography>
                            <Link
                                component="button"
                                variant="caption"
                                onClick={downloadSampleCSV}
                                sx={{ color: '#ed6c02', fontWeight: 800, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Download Ingestion Schema (.CSV)
                            </Link>
                        </Box>
                    </Paper>

                    {/* Feedback Overlays */}
                    {(parsing || importing) && (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                                {parsing ? "Analyzing Ledger Architecture..." : "Synchronizing Records..."}
                            </Typography>
                            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                    )}

                    {errors.length > 0 && (
                        <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 3 }}>
                            <AlertTitle sx={{ fontWeight: 800 }}>Architecture Violations</AlertTitle>
                            <List dense sx={{ py: 0 }}>
                                {errors.map((err, i) => (
                                    <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                                        <ListItemText primary={err} primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }} />
                                    </ListItem>
                                ))}
                            </List>
                        </Alert>
                    )}

                    {warnings.length > 0 && (
                        <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ borderRadius: 3 }}>
                            <AlertTitle sx={{ fontWeight: 800 }}>Logical Deviations</AlertTitle>
                            <List dense sx={{ py: 0 }}>
                                {warnings.map((warn, i) => (
                                    <ListItem key={i} sx={{ px: 0, py: 0.25 }}>
                                        <ListItemText primary={warn} primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }} />
                                    </ListItem>
                                ))}
                            </List>
                        </Alert>
                    )}

                    {/* Preview Matrix */}
                    {preview.length > 0 && errors.length === 0 && (
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1 }}>Ledger Preview (Partial Segment)</Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mt: 1 }}>
                                <Table size="small">
                                    <TableHead sx={{ bgcolor: alpha('#f5f5f5', 0.8) }}>
                                        <TableRow>
                                            {Object.keys(preview[0]).map((h) => (
                                                <TableCell key={h} sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>{h}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {preview.map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).map((val, j) => (
                                                    <TableCell key={j} sx={{ fontSize: '0.75rem' }}>{val}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {/* Actions */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            disabled={importing}
                            sx={{ borderRadius: 3, px: 3, fontWeight: 700, textTransform: 'none' }}
                        >
                            Abort
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!file || parsing || importing || errors.length > 0}
                            onClick={handleImport}
                            sx={{ borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none' }}
                        >
                            {importing ? "Injesting..." : "Commence Batch Entry"}
                        </Button>
                    </Stack>
                </>
            ) : (
                <Stack alignItems="center" spacing={3} sx={{ py: 4, textAlign: 'center' }}>
                    <Box sx={{ position: 'relative' }}>
                        <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main' }} />
                        {importResult.failed?.length > 0 && (
                            <Chip
                                label={`${importResult.failed.length} Failed`}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: -10, right: -20, fontWeight: 900 }}
                            />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Synchronization Finalized</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {importResult.imported?.length || 0} transaction units successfully merged.
                        </Typography>
                    </Box>

                    {(importResult.failed?.length > 0 || importResult.duplicates?.length > 0) && (
                        <Paper sx={{ width: '100%', p: 2, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.5), border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', display: 'block', textAlign: 'left', mb: 1 }}>Anomaly Log:</Typography>
                            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                                {importResult.failed.map((f, i) => (
                                    <ListItem key={i} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 24 }}><ErrorOutline fontSize="small" color="error" /></ListItemIcon>
                                        <ListItemText
                                            primary={`Ref: ${f.invoice}`}
                                            secondary={f.error}
                                            primaryTypographyProps={{ variant: 'caption', fontWeight: 800 }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                                {importResult.duplicates.map((d, i) => (
                                    <ListItem key={i} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 24 }}><WarningAmberOutlined fontSize="small" color="warning" /></ListItemIcon>
                                        <ListItemText
                                            primary={`Duplicate: ${d.invoice}`}
                                            secondary="Record already existence in ledger"
                                            primaryTypographyProps={{ variant: 'caption', fontWeight: 800 }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    <Button variant="contained" onClick={onImportComplete} sx={{ borderRadius: 3, px: 6, fontWeight: 700 }}>
                        Return to Dashboard
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

export default ImportSales;
