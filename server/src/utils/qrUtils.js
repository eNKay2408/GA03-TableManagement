import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

/**
 * QR Code Utility Functions
 * Xử lý logic tạo JWT token và QR Code image
 */

/**
 * Generate a signed JWT token cho QR Code
 * Token chứa: Table ID, Restaurant ID, Timestamp
 * @param {string} tableId - MongoDB ObjectId của bàn
 * @param {string} restaurantId - Restaurant ID
 * @returns {string} JWT token
 */
export const generateQRToken = (tableId, restaurantId) => {
    const payload = {
        tableId: tableId.toString(),
        restaurantId: restaurantId || process.env.RESTAURANT_ID || 'rest_001',
        timestamp: Date.now(),
        type: 'table_qr'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });

    return token;
};

/**
 * Generate QR Code URL from token
 * URL sẽ trỏ đến menu page với token
 * @param {string} token - JWT token
 * @returns {string} Full URL for QR Code
 */
export const generateQRUrl = (token) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/menu?token=${token}`;
};

/**
 * Generate QR Code image as Base64 Data URL
 * @param {string} content - Content to encode (URL)
 * @param {Object} options - QR Code options
 * @returns {Promise<string>} Base64 Data URL của QR image
 */
export const generateQRCodeBase64 = async (content, options = {}) => {
    const defaultOptions = {
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        errorCorrectionLevel: 'M',
        ...options
    };

    try {
        const qrDataUrl = await QRCode.toDataURL(content, defaultOptions);
        return qrDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Generate QR Code image as Buffer (for PNG download)
 * @param {string} content - Content to encode (URL)
 * @param {Object} options - QR Code options
 * @returns {Promise<Buffer>} PNG buffer
 */
export const generateQRCodeBuffer = async (content, options = {}) => {
    const defaultOptions = {
        type: 'png',
        width: 400,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        },
        errorCorrectionLevel: 'H',
        ...options
    };

    try {
        const buffer = await QRCode.toBuffer(content, defaultOptions);
        return buffer;
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Verify và decode QR token
 * @param {string} token - JWT token từ QR code
 * @returns {Object} { valid: boolean, data: Object|null, error: string|null }
 */
export const verifyQRToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token type is correct
        if (decoded.type !== 'table_qr') {
            return {
                valid: false,
                data: null,
                error: 'Invalid token type'
            };
        }

        return {
            valid: true,
            data: {
                tableId: decoded.tableId,
                restaurantId: decoded.restaurantId,
                timestamp: decoded.timestamp,
                issuedAt: decoded.iat,
                expiresAt: decoded.exp
            },
            error: null
        };
    } catch (error) {
        let errorMessage = 'Invalid token';

        if (error.name === 'TokenExpiredError') {
            errorMessage = 'QR Code has expired. Please ask staff for a new QR code.';
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Invalid QR Code. Please scan a valid QR code.';
        }

        return {
            valid: false,
            data: null,
            error: errorMessage
        };
    }
};

/**
 * Generate complete QR data for a table
 * Trả về cả token, URL và Base64 image
 * @param {string} tableId - Table ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Object>} { token, url, qrImage }
 */
export const generateCompleteQRData = async (tableId, restaurantId) => {
    const token = generateQRToken(tableId, restaurantId);
    const url = generateQRUrl(token);
    const qrImage = await generateQRCodeBase64(url);

    return {
        token,
        url,
        qrImage
    };
};
