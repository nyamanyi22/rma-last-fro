import { saleApi } from "./api";

class SaleService {
    // Helper to format backend snake_case to frontend camelCase
    mapSale(sale) {
        if (!sale) return null;
        return {
            ...sale,
            customerName: sale.customer?.full_name || 'Unknown',
            productName: sale.product?.name || 'Unknown',
            formattedAmount: sale.amount
                ? `$${parseFloat(sale.amount).toFixed(2)}`
                : '$0.00',
            warrantyStatus: sale.warranty_expiry_date ?
                (new Date(sale.warranty_expiry_date) > new Date() ? 'Active' : 'Expired') : 'No warranty'
        };
    }

    // Get all sales (admin)
    async getSales(params = {}) {
        try {
            const response = await saleApi.getSales(params);
            if (response.data?.success) {
                const raw = response.data.data;
                // Handle both paginated { data: [...] } and flat array responses
                if (Array.isArray(raw)) {
                    return { ...response.data, data: { data: raw.map(s => this.mapSale(s)), total: raw.length } };
                }
                const items = Array.isArray(raw?.data) ? raw.data : [];
                return {
                    ...response.data,
                    data: { ...raw, data: items.map(s => this.mapSale(s)) }
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get single sale
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

    // Create sale — maps SaleForm camelCase to backend snake_case
    async createSale(saleData) {
        try {
            const response = await saleApi.createSale({
                order_number: saleData.orderNumber,
                invoice_number: saleData.invoiceNumber || null,
                customer_name: saleData.customerName,
                customer_email: saleData.customerEmail,
                product_id: saleData.productId,
                sale_date: saleData.saleDate,
                quantity: saleData.quantity,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update sale
    async updateSale(id, saleData) {
        try {
            const response = await saleApi.updateSale(id, {
                order_number: saleData.orderNumber,
                invoice_number: saleData.invoiceNumber || null,
                customer_name: saleData.customerName,
                customer_email: saleData.customerEmail,
                product_id: saleData.productId,
                sale_date: saleData.saleDate,
                quantity: saleData.quantity,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete sale
    async deleteSale(id) {
        try {
            const response = await saleApi.deleteSale(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Import sales from CSV
    async importSales(file) {
        try {
            const response = await saleApi.importSales(file);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Export sales to CSV
    async exportSales() {
        try {
            const response = await saleApi.exportSales();
            // Create download link
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

    // Link unlinked sale to user
    async linkToUser(email, saleId) {
        try {
            const response = await saleApi.linkToUser({ email, sale_id: saleId });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error handler
    handleError(error) {
        if (error.response?.data?.errors) {
            const firstError = Object.values(error.response.data.errors)[0][0];
            return new Error(firstError);
        }
        return new Error(error.response?.data?.message || 'An error occurred');
    }
}

export default new SaleService();