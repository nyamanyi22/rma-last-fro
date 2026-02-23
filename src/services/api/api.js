import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// All API endpoints in one place
export const authApi = {
    register: (data) => api.post('/register', data),
    login: (email, password) => api.post('/login', { email, password }),
    staffLogin: (email, password) => api.post('/staff/login', { email, password }),
    logout: () => api.post('/logout'),
    getMe: () => api.get('/me'),
};

// ==================== PROFILE MANAGEMENT ENDPOINTS ====================
export const profileApi = {
    // 👈 GET current profile (already in authApi, but included here for completeness)
    getProfile: () => api.get('/profile'),

    // 👈 UPDATE profile - THIS IS WHAT YOU NEED FOR CUSTOMER PROFILE UPDATE
    updateProfile: (data) => api.put('/profile', data),

    // 👈 CHANGE password
    changePassword: (data) => api.put('/profile/password', data),

    // 👈 UPLOAD profile picture (optional)
    uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),

    // 👈 DELETE account
    deleteAccount: () => api.delete('/profile'),
};
//products api
export const productApi = {
    getProducts: (params) => api.get('/admin/products', { params }),
    getProduct: (id) => api.get(`/admin/products/${id}`),
    createProduct: (data) => api.post('/admin/products', data),
    updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),
    bulkDeleteProducts: (ids) => api.post('/admin/products/bulk-delete', { ids }),
    bulkUpdateStatus: (ids, isActive) => api.post('/admin/products/bulk-status', { ids, is_active: isActive }),
    getCategories: () => api.get('/admin/products/categories'),
    getBrands: () => api.get('/admin/products/brands'),
};
//sales api
export const saleApi = {
    getSales: (params) => api.get('/admin/sales', { params }),
    getSale: (id) => api.get(`/admin/sales/${id}`),
    createSale: (data) => api.post('/admin/sales', data),
    updateSale: (id, data) => api.put(`/admin/sales/${id}`, data),
    deleteSale: (id) => api.delete(`/admin/sales/${id}`),
    bulkDeleteSales: (ids) => api.post('/admin/sales/bulk-delete', { ids }),
    importSales: (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/sales/import', formData, { onUploadProgress });
    },
    exportSales: () => api.get('/admin/sales/export', { responseType: 'blob' }),
    linkToUser: (data) => api.post('/admin/sales/link-to-user', data),
    getMySales: (params) => api.get('/sales/my', { params }),
};
//customers api
export const customerApi = {
    getCustomers: (params) => api.get('/admin/customers', { params }),
    getCustomer: (id) => api.get(`/admin/customers/${id}`),
    createCustomer: (data) => api.post('/admin/customers', data),
    updateCustomer: (id, data) => api.put(`/admin/customers/${id}`, data),
    deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
    bulkDeleteCustomers: (ids) => api.post('/admin/customers/bulk-delete', { ids }),
    bulkUpdateStatus: (ids, isActive) => api.post('/admin/customers/bulk-status', { ids, is_active: isActive }),
    importCustomers: (file, onUploadProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/customers/import', formData, { onUploadProgress });
    },
    exportCustomers: () => api.get('/admin/customers/export', { responseType: 'blob' }),
};
export default api;