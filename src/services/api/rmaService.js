// Use ONLY this import - remove the other one!
import api, { rmaApi } from './api';  // ← Named import AND default import (for getFileBlob)

class RMAService {
    // =========================
    // DATA MAPPING
    // =========================

    /**
     * Map backend data to frontend format
     */
    mapRma(rma) {
        if (!rma) return null;
        return {
            id: rma.id,
            rmaNumber: rma.rma_number,
            rmaType: rma.rma_type,
            typeLabel: this.getTypeLabel(rma.rma_type),
            reason: rma.reason,
            reasonLabel: this.getReasonLabel(rma.reason),
            status: rma.status,
            statusLabel: this.getStatusLabel(rma.status),
            statusColor: this.getStatusColor(rma.status),
            priority: rma.priority,
            priorityLabel: this.getPriorityLabel(rma.priority),
            priorityColor: this.getPriorityColor(rma.priority),
            customer: rma.customer,
            contactName: rma.contact_name || (rma.customer ?
                `${rma.customer.first_name || ''} ${rma.customer.last_name || ''}`.trim() :
                'Not available'),
            contactEmail: rma.contact_email || rma.customer?.email || 'Not available',
            contactPhone: rma.contact_phone || rma.customer?.phone || 'Not provided',
            shippingAddress: rma.shipping_address || (rma.customer ?
                [rma.customer.address, rma.customer.city, rma.customer.country]
                    .filter(Boolean)
                    .join(', ') :
                'Not provided'),
            customerName: rma.customer ? `${rma.customer.first_name || ''} ${rma.customer.last_name || ''}`.trim() : 'Not available',
            customerEmail: rma.customer?.email || 'Not available',
            product: rma.product,
            productName: rma.product?.name || 'Unknown',
            issueDescription: rma.issue_description,
            serialNumber: rma.serial_number_provided,
            receiptNumber: rma.receipt_number,
            requiresWarrantyCheck: rma.requires_warranty_check,
            isWarrantyValid: rma.is_warranty_valid,
            warrantyExpiryDate: rma.warranty_expiry_date,
            warrantyStatus: this.getWarrantyStatus(rma),
            attachments: (rma.attachments || []).map(att => this.mapAttachment(att)),
            assignedTo: rma.assigned_to,
            adminNotes: rma.admin_notes,
            rejectionReason: rma.rejection_reason,
            customerMessage: rma.customer_message,
            trackingNumber: rma.tracking_number,
            carrier: rma.carrier,
            shippedAt: rma.shipped_at,
            deliveredAt: rma.delivered_at,
            createdAt: rma.created_at,
            submittedDate: rma.created_at,
            formattedDate: this.formatDate(rma.created_at),
            formattedDateTime: this.formatDateTime(rma.created_at),
            updatedAt: rma.updated_at,
            statusHistory: (rma.status_history || rma.statusHistory || []).map(h => this.mapStatusHistory(h)),
            comments: (rma.comments || []).map(c => this.mapComment(c)),
        };
    }

    /**
     * Map status history record
     */
    mapStatusHistory(history) {
        if (!history) return null;
        return {
            id: history.id,
            oldStatus: history.old_status,
            oldStatusLabel: this.getStatusLabel(history.old_status),
            newStatus: history.new_status,
            newStatusLabel: this.getStatusLabel(history.new_status),
            changedBy: history.changed_by,
            changedByName: history.changer ? 
                (`${history.changer.name || (history.changer.first_name ? `${history.changer.first_name} ${history.changer.last_name}` : 'Unknown')} (${history.changer.short_role_label || history.changer.role_label || history.changer.role || 'User'})`) : 
                (history.changed_by_name || 'System'),
            notes: history.notes,
            createdAt: history.created_at,
            formattedDate: this.formatDateTime(history.created_at),
        };
    }

    /**
     * Map comment record
     */
    mapComment(comment) {
        if (!comment) return null;
        return {
            id: comment.id,
            userId: comment.user_id,
            userName: comment.user ? 
                (`${comment.user.name || `${comment.user.first_name} ${comment.user.last_name}`.trim()} (${comment.user.short_role_label || comment.user.role_label || comment.user.role || 'User'})`) : 
                'Unknown',
            type: comment.type,
            comment: comment.comment,
            notifyCustomer: comment.notify_customer,
            createdAt: comment.created_at,
            formattedDate: this.formatDateTime(comment.created_at),
        };
    }

    /**
     * Map attachment data
     */
    mapAttachment(attachment) {
        if (!attachment) return null;

        return {
            id: attachment.id,
            name: attachment.original_name,
            originalName: attachment.original_name,
            // Prioritize the 'url' provided by the backend (handles both local and cloudinary)
            url: attachment.url || attachment.cloudinary_url || attachment.file_url,
            thumbnail: attachment.thumbnail || attachment.thumbnail_url || attachment.url,
            preview: attachment.preview || attachment.medium_url || attachment.url,
            optimized: attachment.optimized || attachment.optimized_url || attachment.url,
            urls: attachment.urls || null,
            size: attachment.file_size,
            formattedSize: attachment.formatted_size,
            mimeType: attachment.mime_type,
            isImage: attachment.isImage !== undefined ?
                (typeof attachment.isImage === 'function' ? attachment.isImage() : attachment.isImage) :
                attachment.mime_type?.startsWith('image/'),
            uploadedBy: attachment.uploaded_by,
            uploadedByName: attachment.uploaded_by_name,
            uploadedAt: attachment.created_at,
            compressionStats: attachment.compression_stats || null,
        };
    }

    /**
     * Map array of RMAs
     */
    mapRmas(rmas) {
        if (!Array.isArray(rmas)) return [];
        return rmas.map(rma => this.mapRma(rma));
    }

    // =========================
    // HELPER METHODS
    // =========================

    getTypeLabel(type) {
        const types = {
            'simple_return': 'Simple Return',
            'warranty_repair': 'Warranty / Repair',
            'return': 'Simple Return',
            'warranty': 'Warranty Claim',
            'repair': 'Repair'
        };
        return types[type] || type;
    }

    getReasonLabel(reason) {
        const reasons = {
            'shipping_damage': 'Shipping Damage',
            'wrong_item': 'Wrong Item Received',
            'defective_on_arrival': 'Defective on Arrival',
            'customer_return': 'Customer Return',
            'product_failure': 'Product Failure',
            'hardware_defect': 'Hardware Defect',
            'software_issue': 'Software Issue',
            'physical_damage': 'Physical Damage',
            'performance_issue': 'Performance Issue',
            'other': 'Other'
        };
        return reasons[reason] || reason;
    }

    getStatusLabel(status) {
        const statuses = {
            'pending': 'Pending',
            'under_review': 'Under Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'in_repair': 'In Repair',
            'repaired': 'Repaired',
            'ready_for_shipment': 'Ready for Shipment',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statuses[status] || status;
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'under_review': 'info',
            'approved': 'success',
            'rejected': 'error',
            'in_repair': 'secondary',
            'repaired': 'success',
            'ready_for_shipment': 'primary',
            'shipped': 'primary',
            'delivered': 'success',
            'completed': 'success',
            'cancelled': 'default'
        };
        return colors[status] || 'default';
    }

    getPriorityLabel(priority) {
        const priorities = {
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'urgent': 'Urgent'
        };
        return priorities[priority] || priority;
    }

    getPriorityColor(priority) {
        const colors = {
            'low': 'success',
            'medium': 'warning',
            'high': 'error',
            'urgent': 'error'
        };
        return colors[priority] || 'default';
    }

    getWarrantyStatus(rma) {
        if (!rma.requires_warranty_check) {
            return { text: 'Not Applicable', color: 'default' };
        }
        if (rma.is_warranty_valid === null) {
            return { text: 'Pending Check', color: 'warning' };
        }
        return rma.is_warranty_valid
            ? { text: 'Valid', color: 'success' }
            : { text: 'Expired', color: 'error' };
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const validDateString = dateString.includes(' ') && !dateString.includes('T')
                ? dateString.replace(' ', 'T')
                : dateString;
            const date = new Date(validDateString);
            if (isNaN(date.getTime())) return 'Invalid Date';

            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        } catch (e) {
            return 'Invalid Date';
        }
    }

    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // =========================
    // API METHODS - ALL USING rmaApi
    // =========================

    /**
     * Get customer's RMA history
     * GET /customer/my-rmas
     */
    async getMyRmas(params = {}) {
        try {
            const response = await rmaApi.getMyRmas(params);

            if (response.data?.success) {
                const paginated = response.data.data;
                return {
                    success: true,
                    data: {
                        ...paginated,
                        data: this.mapRmas(paginated.data || [])
                    }
                };
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get all RMAs (admin)
     * GET /admin/rma
     */
    async getRmas(params = {}) {
        try {
            const response = await rmaApi.getRmas(params);

            if (response.data?.success) {
                const paginated = response.data.data;
                return {
                    success: true,
                    data: {
                        ...paginated,
                        data: this.mapRmas(paginated.data || [])
                    }
                };
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // =========================
    // ADMIN API METHODS
    // =========================

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        try {
            const response = await rmaApi.getDashboardStats();

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get comprehensive dashboard overview metrics
     * GET /admin/reports/overview
     */
    async getDashboardOverview() {
        try {
            const response = await rmaApi.getDashboardOverview();

            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Export RMAs to CSV
     */
    async exportRmas(params = {}) {
        try {
            const response = await rmaApi.exportRmas(params);

            // Assuming the response is a blob based on api.js
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rma_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get single RMA (admin)
     */
    async getRmaAdmin(id) {
        try {
            const response = await rmaApi.getRmaAdmin(id);

            if (response.data?.success) {
                return {
                    success: true,
                    data: this.mapRma(response.data.data)
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Add comment to RMA (admin)
     */
    async addComment(id, comment, type = 'internal') {
        try {
            const response = await rmaApi.addComment(id, { comment, type });
            if (response.data?.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update RMA (admin)
     */
    async updateRma(id, data) {
        try {
            const response = await rmaApi.updateRma(id, data);

            if (response.data?.success) {
                return {
                    success: true,
                    data: this.mapRma(response.data.data?.rma || response.data.data)
                };
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Submit new RMA
     */
    async submitRma(rmaData) {
        try {
            console.log('📦 submitRma called with:', {
                rmaType: rmaData.rmaType,
                productId: rmaData.productId,
                hasSaleId: !!rmaData.saleId,
                reason: rmaData.reason,
                attachmentsCount: rmaData.attachments?.length || 0
            });

            const formData = new FormData();

            // Add all regular fields
            formData.append('rma_type', rmaData.rmaType);
            formData.append('product_id', String(rmaData.productId));

            if (rmaData.saleId) {
                formData.append('sale_id', String(rmaData.saleId));
            }

            formData.append('reason', (rmaData.reason === 'other_return' || rmaData.reason === 'other_warranty') ? 'other' : rmaData.reason);
            formData.append('issue_description', rmaData.issueDescription);

            if (rmaData.serialNumber) {
                formData.append('serial_number_provided', rmaData.serialNumber);
            }

            if (rmaData.receiptNumber) {
                formData.append('receipt_number', rmaData.receiptNumber);
            }

            // Admin: optionally associate RMA with a specific customer
            if (rmaData.customerId) {
                formData.append('customer_id', String(rmaData.customerId));
            }

            // Contact Info
            if (rmaData.contactName) formData.append('contact_name', rmaData.contactName);
            if (rmaData.contactEmail) formData.append('contact_email', rmaData.contactEmail);
            if (rmaData.contactPhone) formData.append('contact_phone', rmaData.contactPhone);
            if (rmaData.shippingAddress) formData.append('shipping_address', rmaData.shippingAddress);

            // Handle attachments
            if (rmaData.attachments && rmaData.attachments.length > 0) {
                console.log(`📎 Processing ${rmaData.attachments.length} attachments:`);

                rmaData.attachments.forEach((item, index) => {
                    if (item.file instanceof File) {
                        console.log(`  ✅ Appending file ${index}:`, item.file.name);
                        formData.append('attachments[]', item.file);
                    }
                });
            }

            console.log('📤 Sending request to /customer/rma/submit');

            // Use rmaApi.submitRma instead of api.post
            const response = await rmaApi.submitRma(formData);

            console.log('✅ Submit successful:', response.data);

            if (response.data?.success) {
                return {
                    success: true,
                    message: response.data.message,
                    data: this.mapRma(response.data.data?.rma || response.data.data)
                };
            }

            return response.data;

        } catch (error) {
            console.error('❌ submitRma caught error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Admin-only: Create an RMA on behalf of a customer
     * Posts to /admin/rma/create with customer_id
     */
    async adminCreateRma(rmaData) {
        try {
            console.log('📦 adminCreateRma called with:', rmaData);

            const formData = new FormData();

            formData.append('rma_type', rmaData.rmaType);
            formData.append('product_id', String(rmaData.productId));

            if (rmaData.saleId) formData.append('sale_id', String(rmaData.saleId));
            if (rmaData.customerId) formData.append('customer_id', String(rmaData.customerId));

            formData.append('reason', (rmaData.reason === 'other_return' || rmaData.reason === 'other_warranty') ? 'other' : rmaData.reason);
            formData.append('issue_description', rmaData.issueDescription);

            if (rmaData.serialNumber) formData.append('serial_number_provided', rmaData.serialNumber);
            if (rmaData.receiptNumber) formData.append('receipt_number', rmaData.receiptNumber);

            if (rmaData.contactName) formData.append('contact_name', rmaData.contactName);
            if (rmaData.contactEmail) formData.append('contact_email', rmaData.contactEmail);
            if (rmaData.contactPhone) formData.append('contact_phone', rmaData.contactPhone);
            if (rmaData.shippingAddress) formData.append('shipping_address', rmaData.shippingAddress);

            if (rmaData.attachments?.length > 0) {
                rmaData.attachments.forEach((item) => {
                    if (item.file instanceof File) {
                        formData.append('attachments[]', item.file);
                    }
                });
            }

            const response = await rmaApi.adminCreateRma(formData);

            if (response.data?.success) {
                return {
                    success: true,
                    message: response.data.message,
                    data: this.mapRma(response.data.data?.rma || response.data.data)
                };
            }

            return response.data;
        } catch (error) {
            console.error('❌ adminCreateRma caught error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get single customer RMA details
     */
    async getRma(id) {
        try {
            const response = await rmaApi.getRma(id);

            if (response.data?.success) {
                return {
                    success: true,
                    data: this.mapRma(response.data.data)
                };
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Cancel RMA
     */
    async cancelRma(id) {
        try {
            const response = await rmaApi.cancelRma(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // =========================
    // ATTACHMENT METHODS
    // =========================

    /**
     * Get attachment details (customer)
     */
    async getAttachment(id) {
        try {
            const response = await rmaApi.getAttachment(id);

            if (response.data?.success) {
                return {
                    success: true,
                    data: this.mapAttachment(response.data.data)
                };
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Download attachment (customer) - opens in new tab
     */
    downloadAttachment(id) {
        rmaApi.downloadAttachment(id);
        return { success: true };
    }

    /**
     * Download attachment as blob (customer)
     */
    async downloadAttachmentAsBlob(id, filename) {
        try {
            const response = await rmaApi.downloadAttachmentAsBlob(id);

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || `attachment-${id}`);
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                link.remove();
            }, 100);

            return { success: true };
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get file blob securely (for authenticated preview)
     */
    async getFileBlob(url) {
        try {
            const response = await api.get(url, { responseType: 'blob' });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update shipping information (Admin/CSR)
     */
    async updateShipping(id, carrier, trackingNumber) {
        try {
            const response = await rmaApi.updateShipping(id, {
                carrier,
                tracking_number: trackingNumber || ''
            });

            if (response.data?.success) {
                return {
                    success: true,
                    data: this.mapRma(response.data.data),
                    message: response.data.message
                };
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // =========================
    // ERROR HANDLER
    // =========================

    handleError(error) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        console.error('RMA Service Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status,
            responseData
        });

        if (responseData?.errors) {
            console.error('Validation Errors:', responseData.errors);

            // Get the first error message
            const firstErrorKey = Object.keys(responseData.errors)[0];
            const firstErrorMessage = responseData.errors[firstErrorKey][0];

            // Show alert with the actual error
            alert(`Validation Error: ${firstErrorMessage}`);

            return new Error(firstErrorMessage);
        }

        const message = responseData?.message || error.message || 'An error occurred';
        const statusPrefix = status ? `[HTTP ${status}] ` : '';

        // Show alert for other errors too
        alert(`Error: ${statusPrefix}${message}`);

        return new Error(`${statusPrefix}${message}`);
    }
}

export default new RMAService();