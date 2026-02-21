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

export default api;