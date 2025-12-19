import Table from '../models/Table.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import {
    generateQRToken,
    generateQRUrl,
    generateQRCodeBase64,
    generateQRCodeBuffer,
    verifyQRToken,
    generateCompleteQRData
} from '../utils/qrUtils.js';
import { generateTableQRPDF, generateBulkTablesPDF } from '../utils/pdfUtils.js';
import archiver from 'archiver';

/**
 * Table Controller - Xử lý CRUD operations cho tables với MongoDB
 * Ngày 2: Tích hợp QR Code generation
 */
class TableController {
    /**
     * GET /api/tables - Lấy danh sách tất cả bàn
     */
    static async getAllTables(req, res) {
        try {
            const { status, location } = req.query;
            const filter = {};

            if (status && ['Active', 'Inactive'].includes(status)) {
                filter.status = status;
            }

            if (location) {
                filter.location = location;
            }

            const tables = await Table.find(filter).sort({ table_number: 1 });

            res.status(200).json({
                success: true,
                message: 'Tables retrieved successfully',
                data: tables,
                count: tables.length
            });
        } catch (error) {
            console.error('Error getting tables:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * GET /api/tables/:id - Lấy chi tiết một bàn
     */
    static async getTableById(req, res) {
        try {
            const { id } = req.params;

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            const table = await Table.findById(id);

            if (!table) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // Generate QR image on-the-fly if table has token
            let qrImage = null;
            if (table.qr_token) {
                const qrUrl = generateQRUrl(table.qr_token);
                qrImage = await generateQRCodeBase64(qrUrl);
            }

            res.status(200).json({
                success: true,
                message: 'Table retrieved successfully',
                data: {
                    ...table.toObject(),
                    qr_image: qrImage
                }
            });
        } catch (error) {
            console.error('Error getting table:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * POST /api/tables - Tạo bàn mới (Tự động sinh QR Code)
     */
    static async createTable(req, res) {
        try {
            const { table_number, capacity, location, description } = req.body;

            // Validation: Check required fields
            if (!table_number || capacity === undefined || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: table_number, capacity, and location are required'
                });
            }

            // Validation: table_number must not be empty
            const tableNum = String(table_number).trim();
            if (!tableNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Table number cannot be empty'
                });
            }

            // Validation: capacity must be between 1 and 20
            const cap = parseInt(capacity);
            if (isNaN(cap) || cap < 1 || cap > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Capacity must be a positive integer between 1 and 20'
                });
            }

            // Validation: Check if table_number already exists (unique constraint)
            const existingTable = await Table.findOne({ table_number: tableNum });
            if (existingTable) {
                return res.status(409).json({
                    success: false,
                    message: `Table number ${tableNum} already exists. Please choose a different number.`
                });
            }

            // Create the table first
            const newTable = await Table.create({
                table_number: tableNum,
                capacity: cap,
                location: location.trim(),
                description: description ? description.trim() : '',
                status: 'Active',
                restaurant_id: process.env.RESTAURANT_ID || 'rest_001'
            });

            // ===== NGÀY 2: Tự động sinh QR Code khi tạo bàn =====
            const qrToken = generateQRToken(newTable._id, newTable.restaurant_id);

            // Update table với QR token
            newTable.qr_token = qrToken;
            newTable.qr_token_created_at = new Date();
            await newTable.save();

            // Generate QR image để trả về
            const qrUrl = generateQRUrl(qrToken);
            const qrImage = await generateQRCodeBase64(qrUrl);

            res.status(201).json({
                success: true,
                message: 'Table created successfully with QR Code',
                data: {
                    ...newTable.toObject(),
                    qr_url: qrUrl,
                    qr_image: qrImage
                }
            });
        } catch (error) {
            console.error('Error creating table:', error);

            // Handle MongoDB duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Table number already exists'
                });
            }

            // Handle Mongoose validation error
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join('. ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * PUT /api/tables/:id - Cập nhật thông tin bàn
     */
    static async updateTable(req, res) {
        try {
            const { id } = req.params;
            const { table_number, capacity, location, description } = req.body;

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            // Check if table exists
            const existingTable = await Table.findById(id);
            if (!existingTable) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // Validation: Check required fields
            if (!table_number || capacity === undefined || !location) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: table_number, capacity, and location are required'
                });
            }

            // Validation: table_number must not be empty
            const tableNum = String(table_number).trim();
            if (!tableNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Table number cannot be empty'
                });
            }

            // Validation: capacity must be between 1 and 20
            const cap = parseInt(capacity);
            if (isNaN(cap) || cap < 1 || cap > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Capacity must be a positive integer between 1 and 20'
                });
            }

            // Validation: Check if table_number already exists (exclude current table)
            const duplicateTable = await Table.findOne({
                table_number: tableNum,
                _id: { $ne: id }
            });
            if (duplicateTable) {
                return res.status(409).json({
                    success: false,
                    message: `Table number ${tableNum} already exists. Please choose a different number.`
                });
            }

            // Update the table
            const updateData = {
                table_number: tableNum,
                capacity: cap,
                location: location.trim()
            };

            if (description !== undefined) {
                updateData.description = description.trim();
            }

            const updatedTable = await Table.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: 'Table updated successfully',
                data: updatedTable
            });
        } catch (error) {
            console.error('Error updating table:', error);

            // Handle MongoDB duplicate key error
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Table number already exists'
                });
            }

            // Handle Mongoose validation error
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({
                    success: false,
                    message: messages.join('. ')
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * PATCH /api/tables/:id/status - Cập nhật trạng thái bàn (Soft Delete)
     */
    static async updateTableStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            // Validation: Check status value
            if (!status || !['Active', 'Inactive'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status. Must be "Active" or "Inactive"'
                });
            }

            // Check if table exists
            const existingTable = await Table.findById(id);
            if (!existingTable) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // IMPORTANT: Check for active orders before deactivating
            if (status === 'Inactive') {
                const activeOrdersCount = await Order.countDocuments({
                    table_id: id,
                    status: { $in: ['pending', 'preparing'] }
                });

                if (activeOrdersCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot deactivate table. There are active orders on this table. Please complete or cancel all orders first.'
                    });
                }
            }

            // Update status
            const updatedTable = await Table.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            res.status(200).json({
                success: true,
                message: `Table ${status === 'Active' ? 'activated' : 'deactivated'} successfully`,
                data: updatedTable
            });
        } catch (error) {
            console.error('Error updating table status:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // ===== NGÀY 2: Các API mới cho QR Code =====

    /**
     * POST /api/tables/:id/regenerate-qr - Tạo QR mới cho bàn (invalidate QR cũ)
     */
    static async regenerateQR(req, res) {
        try {
            const { id } = req.params;

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            // Check if table exists
            const table = await Table.findById(id);
            if (!table) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // Check if table is active (Model uses 'Active' with capital A)
            if (table.status !== 'Active') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot regenerate QR for inactive table. Please activate the table first.'
                });
            }

            // Generate new QR token (this automatically invalidates the old one)
            const newQRToken = generateQRToken(table._id, table.restaurant_id);

            // Update table with new token
            table.qr_token = newQRToken;
            table.qr_token_created_at = new Date();
            await table.save();

            // Generate QR image
            const qrUrl = generateQRUrl(newQRToken);
            const qrImage = await generateQRCodeBase64(qrUrl);

            res.status(200).json({
                success: true,
                message: 'QR Code regenerated successfully. Old QR codes are now invalid.',
                data: {
                    ...table.toObject(),
                    qr_url: qrUrl,
                    qr_image: qrImage
                }
            });
        } catch (error) {
            console.error('Error regenerating QR:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * GET /api/tables/:id/qr-image - Lấy QR Code image (PNG)
     */
    static async getQRImage(req, res) {
        try {
            const { id } = req.params;
            const { format } = req.query; // 'base64' or 'png'

            // Validate MongoDB ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            // Check if table exists
            const table = await Table.findById(id);
            if (!table) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // Check if table has QR token
            if (!table.qr_token) {
                return res.status(404).json({
                    success: false,
                    message: 'No QR Code found for this table. Please regenerate QR.'
                });
            }

            const qrUrl = generateQRUrl(table.qr_token);

            // Return as PNG file for download
            if (format === 'png') {
                const pngBuffer = await generateQRCodeBuffer(qrUrl);
                res.set({
                    'Content-Type': 'image/png',
                    'Content-Disposition': `attachment; filename="table-${table.table_number}-qr.png"`,
                    'Content-Length': pngBuffer.length
                });
                return res.send(pngBuffer);
            }

            // Default: Return as JSON with base64
            const qrImage = await generateQRCodeBase64(qrUrl);
            res.status(200).json({
                success: true,
                message: 'QR Code retrieved successfully',
                data: {
                    table_id: table._id,
                    table_number: table.table_number,
                    qr_url: qrUrl,
                    qr_image: qrImage
                }
            });
        } catch (error) {
            console.error('Error getting QR image:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    static async getQRPDF(req, res) {
        try {
            const { id } = req.params;

            // Validate ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid table ID format'
                });
            }

            // Get table
            const table = await Table.findById(id);
            if (!table) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            // Check if QR exists
            if (!table.qr_token) {
                return res.status(404).json({
                    success: false,
                    message: 'No QR Code found for this table'
                });
            }

            // Generate PDF
            const qrUrl = generateQRUrl(table.qr_token);
            const pdfBuffer = await generateTableQRPDF(table, qrUrl);

            // Send PDF
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="table-${table.table_number}-qr.pdf"`,
                'Content-Length': pdfBuffer.length
            });

            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * GET /api/tables/qr-pdf/bulk - Download all QR Codes as single PDF
     */
    static async getBulkQRPDF(req, res) {
        try {
            // Get all active tables with QR tokens (Model uses 'Active' with capital A)
            const tables = await Table.find({
                status: 'Active',
                qr_token: { $ne: null }
            }).sort({ table_number: 1 });

            if (tables.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active tables with QR codes found'
                });
            }

            // Generate bulk PDF
            const pdfBuffer = await generateBulkTablesPDF(tables, generateQRUrl);

            // Send PDF
            const timestamp = new Date().toISOString().split('T')[0];
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="all-tables-qr-${timestamp}.pdf"`,
                'Content-Length': pdfBuffer.length
            });

            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error generating bulk PDF:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * POST /api/tables/bulk-regenerate-qr - Regenerate all QR Codes at once
     */
    static async bulkRegenerateQR(req, res) {
        try {
            // Get all active tables
            const tables = await Table.find({ status: 'Active' });

            if (tables.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active tables found'
                });
            }

            const results = {
                success: [],
                failed: []
            };

            // Regenerate QR for each table
            for (const table of tables) {
                try {
                    const newQRToken = generateQRToken(table._id, table.restaurant_id);
                    table.qr_token = newQRToken;
                    table.qr_token_created_at = new Date();
                    await table.save();

                    results.success.push({
                        table_id: table._id,
                        table_number: table.table_number
                    });
                } catch (err) {
                    results.failed.push({
                        table_id: table._id,
                        table_number: table.table_number,
                        error: err.message
                    });
                }
            }

            // Log security event
            console.log(`[SECURITY] Bulk QR regeneration: ${results.success.length} success, ${results.failed.length} failed at ${new Date().toISOString()}`);

            res.status(200).json({
                success: true,
                message: `Bulk QR regeneration completed. ${results.success.length} tables updated, ${results.failed.length} failed.`,
                data: {
                    total_tables: tables.length,
                    successful: results.success.length,
                    failed: results.failed.length,
                    details: results
                }
            });
        } catch (error) {
            console.error('Error in bulk regenerate QR:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    /**
     * GET /api/tables/qr-zip/bulk - Download all QR Codes as ZIP file
     */
    static async downloadBulkQRZIP(req, res) {
        try {
            // Get all active tables with QR tokens
            const tables = await Table.find({
                status: 'Active',
                qr_token: { $ne: null }
            }).sort({ table_number: 1 });

            if (tables.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active tables with QR codes found'
                });
            }

            // Set up ZIP response
            const timestamp = new Date().toISOString().split('T')[0];
            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="all-qr-codes-${timestamp}.zip"`
            });

            // Create ZIP archive
            const archive = archiver('zip', { zlib: { level: 9 } });

            archive.on('error', (err) => {
                throw err;
            });

            // Pipe archive to response
            archive.pipe(res);

            // Add each QR code PNG to the archive
            for (const table of tables) {
                const qrUrl = generateQRUrl(table.qr_token);
                const pngBuffer = await generateQRCodeBuffer(qrUrl);
                archive.append(pngBuffer, { name: `QR_${table.table_number}.png` });
            }

            // Finalize the archive
            await archive.finalize();

            console.log(`[INFO] ZIP download completed: ${tables.length} QR codes`);

        } catch (error) {
            console.error('Error creating ZIP:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

export default TableController;
