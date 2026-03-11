import { customerApi } from './api';

class CustomerService {
    mapCustomer(customer) {
        if (!customer) return null;
        return {
            ...customer,
            customerId: customer.id,
            fullName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
            isActive: customer.is_active,
            createdAt: customer.created_at,
            updatedAt: customer.updated_at,
        };
    }

    unmapCustomer(customerData) {
        return {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone || null,
            country: customerData.country || null,
            address: customerData.address || null,
            city: customerData.city || null,
            postal_code: customerData.postalCode || null,
            is_active: customerData.isActive,
            // Include password only if provided
            ...(customerData.password && { password: customerData.password }),
        };
    }

    // Get all customers (admin) - WITH MAPPING
    async getCustomers(params = {}) {
        try {
            const response = await customerApi.getCustomers(params);
            if (response.data?.success) {
                const customers = response.data.data?.data || [];
                return {
                    ...response.data,
                    data: {
                        ...response.data.data,
                        data: customers.map(c => this.mapCustomer(c))
                    }
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get single customer - WITH MAPPING
    async getCustomer(id) {
        try {
            const response = await customerApi.getCustomer(id);
            if (response.data?.success) {
                response.data.data = this.mapCustomer(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create customer - WITH UNMAPPING
    async createCustomer(data) {
        try {
            const response = await customerApi.createCustomer(this.unmapCustomer(data));
            if (response.data?.success) {
                response.data.data = this.mapCustomer(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update customer - WITH UNMAPPING
    async updateCustomer(id, data) {
        try {
            const response = await customerApi.updateCustomer(id, this.unmapCustomer(data));
            if (response.data?.success) {
                response.data.data = this.mapCustomer(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Delete customer
    async deleteCustomer(id) {
        try {
            const response = await customerApi.deleteCustomer(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Bulk delete customers
    async bulkDeleteCustomers(ids) {
        try {
            const response = await customerApi.bulkDeleteCustomers(ids);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Bulk update status
    async bulkUpdateStatus(ids, isActive) {
        try {
            const response = await customerApi.bulkUpdateStatus(ids, isActive);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Export customers
    async exportCustomers(params = {}) {
        try {
            const response = await customerApi.exportCustomers(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `customers_export_${timestamp}.csv`;
            link.click();
            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Import customers
    async importCustomers(file, onUploadProgress) {
        try {
            const response = await customerApi.importCustomers(file, onUploadProgress);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error handler
    handleError(error) {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });

        const apiError = new Error(error.response?.data?.message || 'An error occurred');

        if (error.response?.data?.errors) {
            // Attach the raw errors object for field-level display
            apiError.errors = error.response.data.errors;
            // Optionally override the message with the first specific error
            const firstError = Object.values(error.response.data.errors)[0][0];
            apiError.message = firstError;
        }

        return apiError;
    }
}

export default new CustomerService();