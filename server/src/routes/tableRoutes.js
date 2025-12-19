import express from 'express';
import TableController from '../controllers/tableController.js';

const router = express.Router();

/**
 * Table Routes
 * Base path: /api/tables
 */

// ===== CRUD APIs (Ngày 1) =====

// GET /api/tables - Lấy danh sách tất cả bàn (có thể filter theo status)
router.get('/', TableController.getAllTables);

// ===== QR Code APIs (Ngày 2) =====

// GET /api/tables/qr-pdf/bulk - Download all QR codes as single PDF
router.get('/qr-pdf/bulk', TableController.getBulkQRPDF);

// GET /api/tables/:id - Lấy chi tiết một bàn theo ID (bao gồm QR image)
router.get('/:id', TableController.getTableById);

// POST /api/tables - Tạo bàn mới (tự động sinh QR Code)
router.post('/', TableController.createTable);

// PUT /api/tables/:id - Cập nhật thông tin bàn
router.put('/:id', TableController.updateTable);

// PATCH /api/tables/:id/status - Cập nhật trạng thái bàn (Soft Delete)
router.patch('/:id/status', TableController.updateTableStatus);

// POST /api/tables/:id/regenerate-qr - Tạo QR mới (invalidate QR cũ)
router.post('/:id/regenerate-qr', TableController.regenerateQR);

// GET /api/tables/:id/qr-image - Lấy QR Code image (PNG download)
router.get('/:id/qr-image', TableController.getQRImage);

// GET /api/tables/:id/qr-pdf - Download QR Code as PDF
router.get('/:id/qr-pdf', TableController.getQRPDF);

export default router;
