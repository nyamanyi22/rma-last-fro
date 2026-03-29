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
import productService from "../../../services/api/productService";

const ImportProducts = ({ onImportComplete, onCancel }) => {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [preview, setPreview] = useState([]);
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef();

    const requiredFields = [
        "sku",
        "name",
        "category",
        "brand",
    ];

    const optionalFields = [
        "description",
        "price",
        "stock_quantity",
        "default_warranty_months",
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

        // Validate price if present
        if (row.price && isNaN(parseFloat(row.price))) {
            rowErrors.push(`Row ${index + 1}: Price must be a number`);
        }

        // Validate stock if present
        if (row.stock_quantity && isNaN(parseInt(row.stock_quantity))) {
            rowErrors.push(`Row ${index + 1}: Stock quantity must be an integer`);
        }

        return rowErrors;
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

                // Check for unknown columns
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
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        const response = await productService.importProducts({
                            products: results.data
                        });

                        if (response.success) {
                            setImportResult({
                                success: true,
                                message: response.message || "Product synchronization complete",
                                imported: response.imported || [],
                                updated: response.updated || [],
                                failed: response.failed || [],
                            });

                            if (response.failed?.length === 0) {
                                setTimeout(() => {
                                    onImportComplete();
                                }, 2000);
                            }
                        } else {
                            setErrors([response.message || "Batch ingestion failure"]);
                        }
                    } catch (error) {
                        setErrors([error.message || "Batch ingestion failure"]);
                    } finally {
                        setImporting(false);
                    }
                }
            });
        } catch (error) {
            console.error("Import error:", error);
            setErrors([error.message || "An unexpected error occurred during batch ingestion"]);
            setImporting(false);
        }
    };

    const downloadSampleCSV = () => {
        const headers = [...requiredFields, ...optionalFields].join(",");
        const sampleRow = [
            "PROD-001", "Gaming Laptop G5", "Laptops", "Asus", "High-end gaming laptop", "1299.99", "50", "24"
        ].join(",");

        const csvContent = `${headers}\n${sampleRow}`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "product_ingestion_blueprint.csv";
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
                            {file ? file.name : "Product Data Selection"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click to select or drop the CSV file here
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
                                Download Sample (.CSV)
                            </Link>
                        </Box>
                    </Paper>

                    {/* Feedback Overlays */}
                    {(parsing || importing) && (
                        <Box sx={{ width: '100%' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                                {parsing ? "Analyzing CSV Architecture..." : "Synchronizing Products..."}
                            </Typography>
                            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                    )}

                    {errors.length > 0 && (
                        <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: 3 }}>
                            <AlertTitle sx={{ fontWeight: 800 }}>Validation Errors</AlertTitle>
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
                            <AlertTitle sx={{ fontWeight: 800 }}>Notes</AlertTitle>
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
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 1 }}>Data Preview</Typography>
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
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!file || parsing || importing || errors.length > 0}
                            onClick={handleImport}
                            sx={{ borderRadius: 3, px: 4, fontWeight: 700, textTransform: 'none' }}
                        >
                            {importing ? "Importing..." : "Start Import"}
                        </Button>
                    </Stack>
                </>
            ) : (
                <Stack alignItems="center" spacing={3} sx={{ py: 4, textAlign: 'center' }}>
                    <Box sx={{ position: 'relative' }}>
                        <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main' }} />
                        {importResult.failed?.length > 0 && (
                            <Chip
                                label={`${importResult.failed.length} Errors`}
                                color="warning"
                                size="small"
                                sx={{ position: 'absolute', top: -10, right: -20, fontWeight: 900 }}
                            />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Import Complete</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {importResult.imported?.length || 0} products created, {importResult.updated?.length || 0} products updated.
                        </Typography>
                    </Box>

                    {importResult.failed?.length > 0 && (
                        <Paper sx={{ width: '100%', p: 2, borderRadius: 3, bgcolor: alpha('#f5f5f5', 0.5), border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', display: 'block', textAlign: 'left', mb: 1 }}>Error Log:</Typography>
                            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                                {importResult.failed.map((f, i) => (
                                    <ListItem key={i} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 24 }}><ErrorOutline fontSize="small" color="error" /></ListItemIcon>
                                        <ListItemText
                                            primary={`Row ${f.row}: SKU ${f.sku}`}
                                            secondary={f.error}
                                            primaryTypographyProps={{ variant: 'caption', fontWeight: 800 }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}

                    <Button variant="contained" onClick={onImportComplete} sx={{ borderRadius: 3, px: 6, fontWeight: 700 }}>
                        Back to Products
                    </Button>
                </Stack>
            )}
        </Stack>
    );
};

export default ImportProducts;
