
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

});

// SINGLE request interceptor with both features
api.interceptors.request.use((config) => {
    // Log the request
    console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasFiles: config.data instanceof FormData,
        data: config.data instanceof FormData ? 'FormData (files)' : config.data
    });

    // Add token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Token added');
    }

    // IMPORTANT: If sending FormData, delete the default Content-Type 
    // to let the browser set it with the correct multipart boundary
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    // Log FormData contents if present (for debugging)
    if (config.data instanceof FormData) {
        console.log('📎 FormData contents:');
        for (let pair of config.data.entries()) {
            if (pair[0] === 'attachments[]') {
                console.log(`  ${pair[0]}: ${pair[1].name} (${pair[1].type}, ${pair[1].size} bytes)`);
            } else {
                console.log(`  ${pair[0]}: ${pair[1]}`);
            }
        }
    }

    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    response => {
        console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('❌ API Error Details:', {
            message: error.message,
            code: error.code,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            },
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : 'No response (network error - server may be down)'
        });
        return Promise.reject(error);
    }
);



// ==================== AUTH ENDPOINTS ====================
export const authApi = {
    register: (data) => api.post('/register', data),
    login: (email, password) => api.post('/login', { email, password }),
    staffLogin: (email, password) => api.post('/staff/login', { email, password }),
    logout: () => api.post('/logout'),
    getMe: () => api.get('/me'),
    forgotPassword: (data) => api.post('/forgot-password', data),
    resetPassword: (data) => api.post('/reset-password', data),
    verifyEmail: (data) => api.post('/verify-email', data),
    resendVerification: (data) => api.post('/resend-verification', data),
};

// ==================== PROFILE ENDPOINTS ====================
export const profileApi = {
    updateProfile: (data) => api.put('/profile', data),
    getProfile: () => api.get('/profile'), // Now global
    deleteAccount: () => api.delete('/profile'),
};

// ==================== PRODUCT ENDPOINTS ====================
export const productApi = {
    // Public/authenticated routes
    getProducts: (params) => api.get('/products', { params }),
    getProduct: (id) => api.get(`/products/${id}`),

    // Admin only routes
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
    bulkDeleteProducts: (ids) => api.post('/admin/products/bulk-delete', { ids }),
    bulkUpdateStatus: (ids, isActive) => api.post('/admin/products/bulk-status', { ids, is_active: isActive }),
    getCategories: () => api.get('/admin/products/categories'),
    getBrands: () => api.get('/admin/products/brands'),
    importProducts: (data) => api.post('/admin/products/import', data),
    exportProducts: (params) => api.get('/admin/products/export', { params, responseType: 'blob' }),
};

// ==================== SALES ENDPOINTS ====================
export const saleApi = {

    getMySales: (params) => api.get('/customer/my-sales', { params }),

    // Admin sales endpoints 
    getSales: (params) => api.get('/admin/sales', { params }),
    getSale: (id) => api.get(`/admin/sales/${id}`),
    createSale: (data) => api.post('/admin/sales', data),
    updateSale: (id, data) => api.put(`/admin/sales/${id}`, data),
    deleteSale: (id) => api.delete(`/admin/sales/${id}`),
    bulkDeleteSales: (ids) => api.post('/admin/sales/bulk-delete', { ids }),
    importSales: (data, config) => {
        if (data instanceof FormData) {
            return api.post('/admin/sales/import', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: config?.onUploadProgress
            });
        }
        return api.post('/admin/sales/import', data, {
            headers: { 'Content-Type': 'application/json' },
            onUploadProgress: config?.onUploadProgress
        });
    },
    exportSales: () => api.get('/admin/sales/export', { responseType: 'blob' }),
    linkToUser: (data) => api.post('/admin/sales/link-to-user', data),
};

// ==================== CUSTOMER ENDPOINTS ====================
export const customerApi = {
    getCustomers: (params) => api.get('/admin/customers', { params }),
    getCustomer: (id) => api.get(`/admin/customers/${id}`),
    createCustomer: (data) => api.post('/admin/customers', data),
    updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
    deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
    bulkDeleteCustomers: (ids) => api.post('/admin/customers/bulk-delete', { ids }),
    bulkUpdateStatus: (ids, isActive) => api.post('/admin/customers/bulk-status', { ids, is_active: isActive }),
    importCustomers: (data) => api.post('/admin/customers/import', data),
    exportCustomers: (params) => api.get('/admin/customers/export', { params, responseType: 'blob' }),
};

// ==================== RMA ENDPOINTS ====================
export const rmaApi = {
    // =========================
    // CUSTOMER RMA ENDPOINTS
    // =========================

    /**
     * Get customer's RMA history
     * GET /customer/my-rmas
     */
    getMyRmas: (params = {}) => api.get('/customer/my-rmas', { params }),

    /**
     * Submit a new RMA request with attachments
     * POST /customer/rma/submit
     */

    submitRma: (data) => {
        // If it's already FormData, send it directly
        if (data instanceof FormData) {
            return api.post('/customer/rma/submit', data, {
                // Set explicitly to undefined to let axios + browser handle boundary
                headers: { 'Content-Type': undefined }
            });
        }

        // Otherwise, create FormData
        const formData = new FormData();

        // Add all fields
        Object.keys(data).forEach(key => {
            if (key === 'attachments' && Array.isArray(data[key])) {
                data[key].forEach(item => {
                    // Extract File object from internal wrapper if necessary
                    const fileToAppend = item instanceof File ? item : item.file;
                    if (fileToAppend instanceof File) {
                        formData.append('attachments[]', fileToAppend);
                    }
                });
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        return api.post('/customer/rma/submit', formData, {
            headers: { 'Content-Type': undefined }
        });
    },
    /**
     * Get single RMA details
     * GET /customer/rma/{id}
     */
    getRma: (id) => api.get(`/customer/rma/${id}`),

    /**
     * Cancel a pending RMA
     * POST /customer/rma/{id}/cancel
     */
    cancelRma: (id) => api.post(`/customer/rma/${id}/cancel`),

    /**
     * Download attachment (legacy method - by path)
     * GET /customer/rma/attachment?path=...
     */
    downloadAttachmentByPath: (path) => api.get('/customer/rma/attachment', {
        params: { path },
        responseType: 'blob'
    }),

    // =========================
    // CUSTOMER ATTACHMENT ENDPOINTS (NEW)
    // =========================

    /**
     * Get attachment details with URLs
     * GET /customer/rma/attachments/{id}
     */
    getAttachment: (id) => api.get(`/customer/rma/attachments/${id}`),

    /**
     * Download attachment (by ID) - opens in new tab
     * GET /customer/rma/attachments/{id}/download
     */
    /**
     * Download attachment (by ID) - This legacy method is now deprecated for protected files.
     * Use downloadAttachmentAsBlob instead to ensure token is sent.
     */
    downloadAttachment: (id) => {
        const token = localStorage.getItem('token');
        const url = `${api.defaults.baseURL}/customer/rma/attachments/${id}/download?token=${token}`;
        window.open(url, '_blank');
    },

    /**
     * Download attachment as blob (by ID)
     * GET /customer/rma/attachments/{id}/download
     */
    downloadAttachmentAsBlob: (id) => api.get(`/customer/rma/attachments/${id}/download`, {
        responseType: 'blob'
    }),

    // =========================
    // ADMIN RMA ENDPOINTS
    // =========================

    /**
     * Get all RMAs with filters
     * GET /admin/rma
     */
    getRmas: (params = {}) => api.get('/admin/rma', { params }),

    /**
     * Get dashboard statistics
     * GET /admin/rma/stats
     */
    getDashboardStats: () => api.get('/admin/rma/stats'),

    /**
     * Get comprehensive dashboard overview metrics
     * GET /admin/reports/overview
     */
    getDashboardOverview: () => api.get('/admin/reports/overview'),

    /**
     * Export RMAs to CSV
     * GET /admin/reports/export
     */
    exportRmas: (params) => api.get('/admin/reports/export', { params, responseType: 'blob' }),

    /**
     * Download attachment (admin legacy)
     * GET /admin/rma/attachment?path=...
     */
    adminDownloadAttachmentByPath: (path) => api.get('/admin/rma/attachment', {
        params: { path },
        responseType: 'blob'
    }),

    /**
     * Create RMA on behalf of a customer (admin only)
     * POST /admin/rma/create
     */
    adminCreateRma: (data) => api.post('/admin/rma/create', data, {
        headers: { 'Content-Type': undefined }
    }),

    /**
     * Bulk delete RMAs
     * POST /admin/rma/bulk-delete
     */
    bulkDeleteRmas: (ids) => api.post('/admin/rma/bulk-delete', { ids }),

    /**
     * Bulk update status
     * POST /admin/rma/bulk-status
     */
    bulkUpdateStatus: (ids, status) => api.post('/admin/rma/bulk-status', { ids, status }),

    // =========================
    // ADMIN ATTACHMENT ENDPOINTS
    // =========================

    /**
     * Get attachment details (admin)
     * GET /admin/rma/attachments/{id}
     */
    getAdminAttachment: (id) => api.get(`/admin/rma/attachments/${id}`),

    /**
     * Delete attachment (admin only)
     * DELETE /admin/rma/attachments/{id}
     */
    deleteAdminAttachment: (id) => api.delete(`/admin/rma/attachments/${id}`),

    /**
     * Download attachment (admin)
     * GET /admin/rma/attachments/{id}/download
     */
    downloadAdminAttachment: (id) => {
        const token = localStorage.getItem('token');
        const url = `${api.defaults.baseURL}/admin/rma/attachments/${id}/download?token=${token}`;
        window.open(url, '_blank');
    },

    /**
     * Get compression statistics
     * GET /admin/rma/attachments/stats/{rmaId}
     */
    getCompressionStats: (rmaId) => api.get(`/admin/rma/attachments/stats/${rmaId}`),

    // =========================
    // ADMIN SINGLE RMA OPERATIONS
    // =========================

    /**
     * Get single RMA (admin)
     * GET /admin/rma/{id}
     */
    getRmaAdmin: (id) => api.get(`/admin/rma/${id}`),

    /**
     * Update RMA
     * PUT /admin/rma/{id}
     */
    updateRma: (id, data) => api.put(`/admin/rma/${id}`, data),

    /**
     * Delete RMA
     * DELETE /admin/rma/{id}
     */
    deleteRma: (id) => api.delete(`/admin/rma/${id}`),

    /**
     * Assign RMA to staff
     * POST /admin/rma/{id}/assign
     */
    assignRma: (id, csrId) => api.post(`/admin/rma/${id}/assign`, { assigned_to: csrId }),

    /**
     * Get RMA comments
     * GET /admin/rma/{id}/comments
     */
    getComments: (id) => api.get(`/admin/rma/${id}/comments`),

    /**
     * Add comment to RMA
     * POST /admin/rma/{id}/comments
     */
    addComment: (id, data) => api.post(`/admin/rma/${id}/comments`, data),

    /**
     * Update shipping information
     * PUT /admin/rma/{id}/shipping
     */
    updateShipping: (id, data) => api.put(`/admin/rma/${id}/shipping`, data),

    // =========================
    // RETURN POLICY ENDPOINTS
    // =========================
    getReturnPolicy: () => api.get('/customer/return-policy'),
    getAdminReturnPolicy: () => api.get('/super-admin/settings/return-policy'),
    updateReturnPolicy: (data) => api.post('/super-admin/settings/return-policy', data),
};

// ==================== SUPER ADMIN ENDPOINTS ====================
export const superAdminApi = {
    // Dashboard overview
    getOverview: () => api.get('/super-admin/overview'),

    // Staff management
    getStaff:    (params) => api.get('/super-admin/staff', { params }),
    createStaff: (data)   => api.post('/super-admin/staff', data),
    updateStaff: (id, data) => api.put(`/super-admin/staff/${id}`, data),
    deleteStaff: (id)     => api.delete(`/super-admin/staff/${id}`),

    // System Settings
    getSettings: () => api.get('/super-admin/settings'),
    updateSettings: (data) => api.post('/super-admin/settings', data),
    getSystemInfo: () => api.get('/super-admin/system-info'),
};

export default api;