import { saleApi } from "./api";
import Papa from 'papaparse';

class SaleService {
    // Map backend snake_case → frontend camelCase
    mapSale(sale) {
        if (!sale) return null;
        console.log('Mapping sale:', sale);
        return {
            ...sale,
            customerId: sale.customer_id ?? '',
            productId: sale.product_id ?? '',
            invoiceNumber: sale.invoice_number ?? '',
            saleDate: sale.sale_date ?? '',
            amount: sale.amount ?? 0,
            serialNumber: sale.serial_number ?? '',
            quantity: sale.quantity ?? 1,
            warrantyMonths: sale.warranty_months ?? 12,
            paymentMethod: sale.payment_method ?? '',
            notes: sale.notes ?? '',
            customerName: sale.customer_name ??
                (sale.customer ? `${sale.customer.first_name ?? ''} ${sale.customer.last_name ?? ''}`.trim() : 'Unknown'),
            customerEmail: sale.customer?.email ?? sale.customer_email ?? '',
            warrantyStatus: sale.warranty_expiry_date
                ? new Date(sale.warranty_expiry_date) > new Date()
                    ? 'Active'
                    : 'Expired'
                : 'No warranty',
        };
    }

    // ── GET ALL SALES (Admin) ─────────────────────────
    async getSales(params = {}) {
        try {
            const response = await saleApi.getSales(params);
            if (response.data?.success) {
                const raw = response.data.data;
                const items = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
                return {
                    ...response.data,
                    data: { ...raw, data: items.map((s) => this.mapSale(s)) },
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── GET SINGLE SALE ───────────────────────
    async getSale(id) {
        try {
            const response = await saleApi.getSale(id);
            if (response.data?.success) {
                response.data.data = this.mapSale(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── CREATE SALE ──────────────────────────
    async createSale(saleData) {
        try {
            const response = await saleApi.createSale({
                invoice_number: saleData.invoiceNumber || null,
                customer_id: saleData.customerId || null,
                customer_email: saleData.customerEmail || null,
                customer_name: saleData.customerName || null,
                product_id: saleData.productId,
                sale_date: saleData.saleDate,
                amount: saleData.amount ?? 0,
                quantity: saleData.quantity ?? 1,
                serial_number: saleData.serialNumber || null,
                warranty_months: saleData.warrantyMonths ?? 12,
                payment_method: saleData.paymentMethod || null,
                notes: saleData.notes || null,
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── UPDATE SALE ──────────────────────────
    async updateSale(id, saleData) {
        try {
            console.log('🟡 SALE SERVICE - updateSale called');
            console.log('🟡 ID:', id);
            console.log('🟡 Data:', saleData);

            const response = await saleApi.updateSale(id, {
                invoice_number: saleData.invoiceNumber,
                customer_id: saleData.customerId,
                customer_email: saleData.customerEmail,
                customer_name: saleData.customerName,
                product_id: saleData.productId,
                sale_date: saleData.saleDate,
                amount: saleData.amount,
                quantity: saleData.quantity,
                serial_number: saleData.serialNumber,
                warranty_months: saleData.warrantyMonths,
                payment_method: saleData.paymentMethod,
                notes: saleData.notes,
            });

            console.log('🟡 Update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('🔴 Update error:', error.response?.data || error);
            throw this.handleError(error);
        }
    }

    // ── DELETE SINGLE SALE ───────────────────
    async deleteSale(id) {
        try {
            const response = await saleApi.deleteSale(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── BULK DELETE SALES ────────────────────
    async bulkDeleteSales(ids) {
        try {
            const response = await saleApi.bulkDeleteSales(ids);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── EXPORT SALES TO CSV ──────────────────
    async exportSales() {
        try {
            const response = await saleApi.exportSales();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sales.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── LINK SALE TO USER ────────────────────
    async linkToUser(email, saleId) {
        try {
            const response = await saleApi.linkToUser({ email, sale_id: saleId });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ── GET MY SALES (for customer) ──────────
    async getMySales() {
        try {
            const response = await saleApi.getMySales();
            console.log('📦 getMySales raw response:', response);

            const data = response.data;

            // Handle different response structures
            if (data?.success) {
                const rawData = data.data;
                // If it's a direct array or a paginated object with .data array
                const items = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

                return {
                    ...data,
                    data: items.map(sale => this.mapSale(sale))
                };
            }

            return data;
        } catch (error) {
            console.error('🔴 Error fetching my sales:', error);
            throw this.handleError(error);
        }
    }

    // ── IMPORT SALES FROM CSV ───────────────
    async importSales(file, onUploadProgress) {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                reject(new Error('Invalid file. Please select a valid CSV file.'));
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    try {
                        console.log('Raw CSV data:', results.data);

                        // Process data - convert strings to numbers
                        const processedData = results.data.map(row => ({
                            ...row,
                            product_id: parseInt(row.product_id),
                            amount: parseFloat(row.amount),
                            quantity: parseInt(row.quantity || 1),
                            warranty_months: parseInt(row.warranty_months || 12)
                        }));

                        console.log('Processed data:', processedData);

                        if (!processedData || processedData.length === 0) {
                            reject(new Error('CSV file is empty'));
                            return;
                        }

                        const response = await saleApi.importSales(
                            { sales: processedData },
                            { onUploadProgress }
                        );

                        resolve(response.data);
                    } catch (error) {
                        console.error('Import error:', error);
                        reject(this.handleError(error));
                    }
                },
                error: (error) => {
                    console.error('CSV parse error:', error);
                    reject(new Error(`Failed to parse CSV: ${error.message}`));
                }
            });
        });
    }

    // ── ERROR HANDLER ───────────────────────
    handleError(error) {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });

        const apiError = new Error(error.response?.data?.message || 'An error occurred');

        if (error.response?.data?.errors) {
            // Attach raw errors for field-level mapping
            apiError.errors = error.response.data.errors;
            // Use first specific error as the main message
            const firstError = Object.values(error.response.data.errors)[0][0];
            apiError.message = firstError;
        }

        return apiError;
    }
}

export default new SaleService();