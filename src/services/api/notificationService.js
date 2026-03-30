import api from './api';

const notificationService = {
    /**
     * Get unread notifications for a staff member
     */
    async getUnreadNotifications(limit = 20) {
        try {
            const response = await api.get(`/notifications?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch unread notifications', error);
            throw error;
        }
    },

    /**
     * Get all notifications (paginated)
     */
    async getAllNotifications(page = 1, limit = 50) {
        try {
            const response = await api.get(`/notifications/all?page=${page}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch all notifications', error);
            throw error;
        }
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount() {
        try {
            const response = await api.get('/notifications/unread-count');
            return response.data.count || 0;
        } catch (error) {
            console.error('Failed to fetch notification count', error);
            return 0;
        }
    },

    /**
     * Mark a specific notification as read
     */
    async markAsRead(id) {
        try {
            const response = await api.post(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     */
    async markAllRead() {
        try {
            const response = await api.post('/notifications/mark-all-read');
            return response.data;
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
            throw error;
        }
    },

    /**
     * Delete a notification
     */
    async deleteNotification(id) {
        try {
            const response = await api.delete(`/notifications/${id}`);
            return response.data;
        } catch (error) {
            console.error('Failed to delete notification', error);
            throw error;
        }
    },

    /**
     * Clear all notifications
     */
    async clearAll() {
        try {
            const response = await api.delete('/notifications/clear-all');
            return response.data;
        } catch (error) {
            console.error('Failed to clear all notifications', error);
            throw error;
        }
    }
};

export default notificationService;
