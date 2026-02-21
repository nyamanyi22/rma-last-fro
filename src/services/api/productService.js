import { productApi } from './api';

class ProductService {
    // Helper to map backend snake_case to frontend camelCase
    mapProduct(product) {
        if (!product) return null;
        return {
            ...product,
            stockQuantity: product.stock_quantity,
            isActive: product.is_active,
            defaultWarrantyMonths: product.default_warranty_months || product.warranty_months,
            // Keep original fields for safety if needed
        };
    }

    // Helper to map frontend camelCase to backend snake_case
    unmapProduct(productData) {
        return {
            sku: productData.sku,
            name: productData.name,
            description: productData.description,
            category: productData.category,
            brand: productData.brand,
            price: typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price,
            stock_quantity: parseInt(productData.stockQuantity),
            default_warranty_months: parseInt(productData.defaultWarrantyMonths),
            specifications: productData.specifications
                ? (typeof productData.specifications === 'string' ? JSON.parse(productData.specifications) : productData.specifications)
                : null,
            is_active: productData.isActive,
        };
    }

    async getProducts(params = {}) {
        try {
            const response = await productApi.getProducts(params);
            if (response.data && response.data.success && response.data.data) {
                // Handle paginated response
                const products = response.data.data.data || [];
                response.data.data.data = products.map(p => this.mapProduct(p));
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getProduct(id) {
        try {
            const response = await productApi.getProduct(id);
            if (response.data && response.data.success && response.data.data) {
                response.data.data = this.mapProduct(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createProduct(productData) {
        try {
            const response = await productApi.createProduct(this.unmapProduct(productData));
            if (response.data && response.data.success && response.data.data) {
                response.data.data = this.mapProduct(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateProduct(id, productData) {
        try {
            const response = await productApi.updateProduct(id, this.unmapProduct(productData));
            if (response.data && response.data.success && response.data.data) {
                response.data.data = this.mapProduct(response.data.data);
            }
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteProduct(id) {
        try {
            const response = await productApi.deleteProduct(id);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async bulkDeleteProducts(ids) {
        try {
            const response = await productApi.bulkDeleteProducts(ids);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async bulkUpdateStatus(ids, isActive) {
        try {
            const response = await productApi.bulkUpdateStatus(ids, isActive);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getCategories() {
        try {
            const response = await productApi.getCategories();
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getBrands() {
        try {
            const response = await productApi.getBrands();
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    handleError(error) {
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Network error (no response)
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
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return new Error('Session expired. Please login again.');
        }

        // Authorization errors (403)
        if (status === 403) {
            return new Error('You do not have permission to perform this action.');
        }

        // Not found (404)
        if (status === 404) {
            return new Error('Resource not found. Please check the URL.');
        }

        // Server errors (500)
        if (status >= 500) {
            return new Error('Server error. Please try again later.');
        }

        // Specific error messages from backend
        if (data?.message) {
            return new Error(data.message);
        }

        // If we have response data but no message
        if (data) {
            console.error('Unexpected error response:', data);
            return new Error('An unexpected error occurred. Check console for details.');
        }

        // Fallback
        return new Error('An error occurred. Please try again.');
    }
}

export default new ProductService();