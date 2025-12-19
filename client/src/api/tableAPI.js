/**
 * API Service for Table Management
 * Base URL: http://localhost:5000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic API call handler
 */
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Table API endpoints
 */
export const tableAPI = {
    /**
     * Get all tables with optional filters
     * @param {Object} params - Query parameters (status, location)
     * @returns {Promise<Object>} Response with tables array
     */
    getAllTables: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/tables?${queryString}` : '/tables';
        return apiCall(endpoint);
    },

    /**
     * Get a single table by ID
     * @param {string} id - Table ID
     * @returns {Promise<Object>} Response with table data
     */
    getTableById: async (id) => {
        return apiCall(`/tables/${id}`);
    },

    /**
     * Create a new table
     * @param {Object} tableData - Table data (table_number, capacity, location, description)
     * @returns {Promise<Object>} Response with created table
     */
    createTable: async (tableData) => {
        return apiCall('/tables', {
            method: 'POST',
            body: JSON.stringify({
                table_number: tableData.number,
                capacity: tableData.capacity,
                location: tableData.location,
                description: tableData.description || '',
            }),
        });
    },

    /**
     * Update a table
     * @param {string} id - Table ID
     * @param {Object} tableData - Updated table data
     * @returns {Promise<Object>} Response with updated table
     */
    updateTable: async (id, tableData) => {
        return apiCall(`/tables/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                table_number: tableData.number,
                capacity: tableData.capacity,
                location: tableData.location,
                description: tableData.description || '',
            }),
        });
    },

    /**
     * Update table status
     * @param {string} id - Table ID
     * @param {string} status - New status (Active/Inactive)
     * @returns {Promise<Object>} Response with updated table
     */
    updateTableStatus: async (id, status) => {
        return apiCall(`/tables/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    /**
     * Regenerate QR code for a table
     * @param {string} id - Table ID
     * @returns {Promise<Object>} Response with new QR data
     */
    regenerateQR: async (id) => {
        return apiCall(`/tables/${id}/regenerate-qr`, {
            method: 'POST',
        });
    },

    /**
     * Get QR code image for a table
     * @param {string} id - Table ID
     * @param {string} format - Format (base64 or png)
     * @returns {Promise<Object>} Response with QR image
     */
    getQRImage: async (id, format = 'base64') => {
        return apiCall(`/tables/${id}/qr-image?format=${format}`);
    },

    /**
     * Download QR code as PDF
     * @param {string} id - Table ID
     * @returns {Promise<Blob>} PDF blob
     */
    downloadQRPDF: async (id) => {
        const response = await fetch(`${API_BASE_URL}/tables/${id}/qr-pdf`);
        if (!response.ok) {
            throw new Error('Failed to download PDF');
        }
        return response.blob();
    },

    /**
     * Download all QR codes as bulk PDF
     * @returns {Promise<Blob>} PDF blob
     */
    downloadBulkQRPDF: async () => {
        const response = await fetch(`${API_BASE_URL}/tables/qr-pdf/bulk`);
        if (!response.ok) {
            throw new Error('Failed to download bulk PDF');
        }
        return response.blob();
    },

    /**
     * Download all QR codes as ZIP file
     * @returns {Promise<Blob>} ZIP blob
     */
    downloadBulkQRZIP: async () => {
        const response = await fetch(`${API_BASE_URL}/tables/qr-zip/bulk`);
        if (!response.ok) {
            throw new Error('Failed to download ZIP');
        }
        return response.blob();
    },

    /**
     * Regenerate all QR codes at once
     * @returns {Promise<Object>} Response with results
     */
    bulkRegenerateQR: async () => {
        return apiCall('/tables/bulk-regenerate-qr', {
            method: 'POST',
        });
    },
};

/**
 * Helper function to transform backend table data to frontend format
 * @param {Object} backendTable - Table from backend
 * @returns {Object} Transformed table for frontend
 */
export function transformTableData(backendTable) {
    return {
        id: backendTable._id,
        number: backendTable.table_number,
        capacity: backendTable.capacity,
        location: backendTable.location,
        status: backendTable.status,
        description: backendTable.description || '',
        createdAt: backendTable.created_at,
        updatedAt: backendTable.updated_at,
        hasQRCode: !!backendTable.qr_token,
        qrToken: backendTable.qr_token,
        qrTokenCreatedAt: backendTable.qr_token_created_at,
    };
}

/**
 * Helper function to download a blob as file
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename
 */
export function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

export default tableAPI;
