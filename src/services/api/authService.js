// src/services/authService.js
import { authApi, profileApi } from './api';

class AuthService {
    /**
     * Register a new customer
     */
    async register(userData) {
        try {
            const response = await authApi.register({
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                password: userData.password,
                password_confirmation: userData.confirmPassword,
                phone: userData.phone || null,
                country: userData.country || null,
                address: userData.address || null,
                city: userData.city || null,
                postal_code: userData.postalCode || null,
            });

            const token = response.data.token || response.data.access_token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.setupAutoLogout();
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Customer login
     */
    async login(email, password) {
        try {
            const response = await authApi.login(email, password);

            const token = response.data.token || response.data.access_token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.setupAutoLogout();
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Staff login (CSR, Admin, Super Admin)
     */
    async staffLogin(email, password) {
        try {
            const response = await authApi.staffLogin(email, password);

            const token = response.data.token || response.data.access_token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                this.setupAutoLogout();
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser() {
        try {
            const response = await authApi.getMe();

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update user profile
     */
    /**
     * Update user profile - FIXED ✅
     */
    async updateProfile(profileData) {  // ✅ Fixed method name
        try {
            const response = await profileApi.updateProfile({  // ✅ Use profileApi
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone || null,
                country: profileData.country || null,
                address: profileData.address || null,
                city: profileData.city || null,
                postal_code: profileData.postalCode || null,
            });

            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Change password - FIXED ✅
     */
    async changePassword(currentPassword, newPassword, confirmPassword) {
        try {
            const response = await profileApi.changePassword({  // ✅ Use profileApi
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Delete account - FIXED ✅
     */
    async deleteAccount() {
        try {
            const response = await profileApi.deleteAccount();  // ✅ Use profileApi
            this.clearSession();
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Refresh token
     */
    async refreshToken() {
        try {
            const response = await authApi.refreshToken();

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            this.clearSession();
            throw this.handleError(error);
        }
    }

    /**
     * Forgot password - send reset email
     */
    async forgotPassword(email) {
        try {
            const response = await authApi.forgotPassword({ email });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(email, token, password, confirmPassword) {
        try {
            const response = await authApi.resetPassword({
                email,
                token,
                password,
                password_confirmation: confirmPassword,
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Verify email
     */
    async verifyEmail(id, hash) {
        try {
            const response = await authApi.verifyEmail(id, hash);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Resend verification email
     */
    async resendVerificationEmail() {
        try {
            const response = await authApi.resendVerificationEmail();
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUserFromStorage();
        return !!(token && user);
    }

    /**
     * Get stored token
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Get user from localStorage
     */
    getUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Get formatted user with helpers
     */
    getCurrentUserData() {
        const user = this.getUserFromStorage();
        if (!user) return null;

        return {
            ...user,
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            isCustomer: user.role === 'customer',
            isStaff: ['csr', 'admin', 'super_admin'].includes(user.role),
            isAdmin: ['admin', 'super_admin'].includes(user.role),
            isSuperAdmin: user.role === 'super_admin',
        };
    }

    /**
     * Check if token is expired
     */
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    /**
     * Set up auto logout (optional)
     */
    setupAutoLogout() {
        const token = this.getToken();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();

            if (expiresIn > 0) {
                setTimeout(() => {
                    if (this.isAuthenticated()) {
                        this.logout();
                        window.location.href = '/login?session=expired';
                    }
                }, expiresIn);
            }
        } catch {
            // Ignore token decode errors
        }
    }

    /**
     * Clear session data
     */
    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        // Network error
        if (!error.response) {
            return new Error('Network error. Please check your connection.');
        }

        const { status, data } = error.response;

        // Validation errors (422)
        if (status === 422 && data.errors) {
            const firstError = Object.values(data.errors)[0][0];
            return new Error(firstError);
        }

        // Authentication errors (401)
        if (status === 401) {
            this.clearSession();
            return new Error(data.message || 'Session expired. Please login again.');
        }

        // Authorization errors (403)
        if (status === 403) {
            return new Error(data.message || 'You do not have permission to perform this action.');
        }

        // Server errors (500)
        if (status >= 500) {
            return new Error('Server error. Please try again later.');
        }

        // Default error message
        return new Error(data.message || 'An unexpected error occurred.');
    }

    /**
     * Set auth header for axios (call this on app startup)
     */
    setAuthHeader() {
        const token = this.getToken();
        if (token) {
            authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
}

export default new AuthService();