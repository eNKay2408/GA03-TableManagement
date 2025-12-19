import express from 'express';
import Table from '../models/Table.js';
import { verifyQRToken, generateQRUrl } from '../utils/qrUtils.js';

const router = express.Router();

/**
 * QR Verification Routes
 * Base path: /api/verify
 */

/**
 * GET /api/verify?token=xxx - Verify QR token khi user scan
 * Trả về thông tin bàn nếu token valid
 */
router.get('/', async (req, res) => {
    try {
        const { token } = req.query;

        // Check if token is provided
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Missing token parameter. Please scan a valid QR code.',
                error_code: 'MISSING_TOKEN'
            });
        }

        // Verify token (JWT verification)
        const verification = verifyQRToken(token);

        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                message: verification.error,
                error_code: 'INVALID_TOKEN'
            });
        }

        // Find table by ID from token
        const table = await Table.findById(verification.data.tableId);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found. This QR code may be outdated.',
                error_code: 'TABLE_NOT_FOUND'
            });
        }

        // IMPORTANT: Check if token matches the current token in DB
        // This ensures old/regenerated tokens are invalidated
        if (table.qr_token !== token) {
            return res.status(401).json({
                success: false,
                message: 'This QR Code has been updated. Please scan the new QR code on the table.',
                error_code: 'TOKEN_REGENERATED'
            });
        }

        // Check if table is active (Model uses 'Active' with capital A)
        if (table.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'This table is currently not available. Please contact staff.',
                error_code: 'TABLE_INACTIVE'
            });
        }

        // Success! Return table info with full details for MenuPage
        res.status(200).json({
            success: true,
            message: 'QR Code verified successfully',
            data: {
                table_id: table._id,
                table: {
                    _id: table._id,
                    table_number: table.table_number,
                    capacity: table.capacity,
                    location: table.location,
                    description: table.description || '',
                    status: table.status
                },
                restaurant_id: table.restaurant_id,
                verified_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error verifying QR token:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the QR code. Please try again.',
            error_code: 'SERVER_ERROR'
        });
    }
});

/**
 * POST /api/verify - Verify QR token (alternative với token trong body)
 */
router.post('/', async (req, res) => {
    try {
        const { token } = req.body;

        // Check if token is provided
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Missing token in request body.',
                error_code: 'MISSING_TOKEN'
            });
        }

        // Verify token
        const verification = verifyQRToken(token);

        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                message: verification.error,
                error_code: 'INVALID_TOKEN'
            });
        }

        // Find table and validate
        const table = await Table.findById(verification.data.tableId);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found.',
                error_code: 'TABLE_NOT_FOUND'
            });
        }

        // Check token matches current token (invalidate old tokens)
        if (table.qr_token !== token) {
            return res.status(401).json({
                success: false,
                message: 'This QR Code is no longer valid. Please scan the updated QR code.',
                error_code: 'TOKEN_REGENERATED'
            });
        }

        // Check table status (Model uses 'Active' with capital A)
        if (table.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'This table is currently unavailable.',
                error_code: 'TABLE_INACTIVE'
            });
        }

        // Return full table info for MenuPage consistency
        res.status(200).json({
            success: true,
            message: 'Token verified successfully',
            data: {
                table_id: table._id,
                table: {
                    _id: table._id,
                    table_number: table.table_number,
                    capacity: table.capacity,
                    location: table.location,
                    description: table.description || '',
                    status: table.status
                },
                restaurant_id: table.restaurant_id,
                verified_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error_code: 'SERVER_ERROR'
        });
    }
});

export default router;
