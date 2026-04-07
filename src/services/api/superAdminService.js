import { superAdminApi } from './api';

class SuperAdminService {

    // ================================================================
    // DASHBOARD OVERVIEW
    // ================================================================

    async getOverview() {
        try {
            const response = await superAdminApi.getOverview();
            if (response.data?.success) {
                return { success: true, data: response.data.data };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ================================================================
    // STAFF MANAGEMENT
    // ================================================================

    async getStaff(params = {}) {
        try {
            const response = await superAdminApi.getStaff(params);
            if (response.data?.success) {
                return { success: true, data: response.data.data };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createStaff(data) {
        try {
            const response = await superAdminApi.createStaff(data);
            if (response.data?.success) {
                return { success: true, data: response.data.data, message: response.data.message };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateStaff(id, data) {
        try {
            const response = await superAdminApi.updateStaff(id, data);
            if (response.data?.success) {
                return { success: true, data: response.data.data, message: response.data.message };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteStaff(id) {
        try {
            const response = await superAdminApi.deleteStaff(id);
            if (response.data?.success) {
                return { success: true, message: response.data.message };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ================================================================
    // SYSTEM SETTINGS
    // ================================================================

    async getSettings() {
        try {
            const response = await superAdminApi.getSettings();
            if (response.data?.success) {
                return { success: true, data: response.data.data };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateSettings(data) {
        try {
            const response = await superAdminApi.updateSettings(data);
            if (response.data?.success) {
                return { success: true, data: response.data.data, message: response.data.message };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ================================================================
    // ERROR HANDLER
    // ================================================================

    handleError(error) {
        const status          = error.response?.status;
        const responseData    = error.response?.data;
        const isMaintenanceMode = status === 503 || responseData?.maintenance_mode;
        const message         = responseData?.message || error.message || 'An error occurred';

        if (responseData?.errors) {
            const firstKey = Object.keys(responseData.errors)[0];
            return new Error(responseData.errors[firstKey][0]);
        }

        if (isMaintenanceMode) {
            return new Error('The system is currently under maintenance. Please try again in a little while.');
        }

        const prefix = status ? `[HTTP ${status}] ` : '';
        return new Error(`${prefix}${message}`);
    }
}

export default new SuperAdminService();
