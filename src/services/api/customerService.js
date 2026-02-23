import { customerApi } from './api';

class CustomerService {
    // Get all customers (admin)
    async getCustomers(params = {}) {
        try {
            const response = await customerApi.getCustomers(params);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get single customer
    async getCustomer(id) {
        try {
            const response = await customerApi.getCustomer(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Create customer
    async createCustomer(data) {
        try {
            const response = await customerApi.createCustomer(data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update customer
    async updateCustomer(id, data) {
        try {
            const response = await customerApi.updateCustomer(id, data);
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

    // Error handler
    handleError(error) {
        if (error.response?.data?.errors) {
            const firstError = Object.values(error.response.data.errors)[0][0];
            return new Error(firstError);
        }
        return new Error(error.response?.data?.message || 'An error occurred');
    }
}

export default new CustomerService();