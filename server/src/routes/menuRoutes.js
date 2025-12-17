import express from 'express';
import Table from '../models/Table.js';
import { verifyQRToken } from '../utils/qrUtils.js';

const router = express.Router();

/**
 * Menu Routes - API cho khách hàng khi scan QR
 * Base path: /api/menu
 */

/**
 * GET /api/menu?token=xxx - Trang menu khi user scan QR
 * Verify token và trả về thông tin bàn + menu
 */
router.get('/', async (req, res) => {
    try {
        const { token } = req.query;

        // Check if token is provided
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng quét mã QR hợp lệ.',
                error_code: 'MISSING_TOKEN',
                redirect: '/scan-error'
            });
        }

        // Verify JWT token
        const verification = verifyQRToken(token);

        if (!verification.valid) {
            return res.status(401).json({
                success: false,
                message: verification.error,
                error_code: 'INVALID_TOKEN',
                user_message: 'Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ nhân viên.',
                redirect: '/scan-error'
            });
        }

        // Find table by ID from token
        const table = await Table.findById(verification.data.tableId);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Bàn không tồn tại.',
                error_code: 'TABLE_NOT_FOUND',
                user_message: 'Không tìm thấy bàn. Mã QR có thể đã cũ.',
                redirect: '/scan-error'
            });
        }

        // CRITICAL: Check if token matches current token in DB
        // This invalidates old/regenerated tokens
        if (table.qr_token !== token) {
            return res.status(401).json({
                success: false,
                message: 'Mã QR đã được cập nhật.',
                error_code: 'TOKEN_REGENERATED',
                user_message: 'Mã QR này đã được thay thế. Vui lòng quét mã QR mới trên bàn.',
                redirect: '/scan-error'
            });
        }

        // Check if table is active
        if (table.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Bàn hiện không hoạt động.',
                error_code: 'TABLE_INACTIVE',
                user_message: 'Bàn này hiện không khả dụng. Vui lòng liên hệ nhân viên.',
                redirect: '/scan-error'
            });
        }

        // SUCCESS! Return table info and menu access
        res.status(200).json({
            success: true,
            message: 'Chào mừng đến nhà hàng!',
            data: {
                table: {
                    id: table._id,
                    table_number: table.table_number,
                    capacity: table.capacity,
                    restaurant_id: table.restaurant_id
                },
                session: {
                    verified_at: new Date().toISOString(),
                    token_issued_at: new Date(verification.data.timestamp).toISOString()
                },
                // Menu categories - có thể mở rộng sau
                menu_categories: [
                    { id: 'appetizers', name: 'Khai vị', icon: '🥗' },
                    { id: 'main', name: 'Món chính', icon: '🍖' },
                    { id: 'seafood', name: 'Hải sản', icon: '🦐' },
                    { id: 'drinks', name: 'Đồ uống', icon: '🍹' },
                    { id: 'desserts', name: 'Tráng miệng', icon: '🍰' }
                ],
                redirect: `/menu/${table._id}`
            }
        });
    } catch (error) {
        console.error('Error accessing menu:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra. Vui lòng thử lại.',
            error_code: 'SERVER_ERROR',
            redirect: '/scan-error'
        });
    }
});

/**
 * GET /api/menu/:tableId - Lấy menu cho bàn cụ thể (sau khi đã verify)
 * Có thể thêm session token để bảo mật
 */
router.get('/:tableId', async (req, res) => {
    try {
        const { tableId } = req.params;

        // Validate table exists
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Bàn không tồn tại'
            });
        }

        if (table.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Bàn không khả dụng'
            });
        }

        // Return menu items (sample data - có thể mở rộng với database)
        res.status(200).json({
            success: true,
            data: {
                table: {
                    id: table._id,
                    table_number: table.table_number
                },
                restaurant: {
                    id: table.restaurant_id,
                    name: process.env.RESTAURANT_NAME || 'Demo Restaurant'
                },
                menu: {
                    appetizers: [
                        { id: 'a1', name: 'Gỏi cuốn', price: 45000, description: 'Bánh tráng cuốn tôm thịt', image: null },
                        { id: 'a2', name: 'Chả giò', price: 55000, description: 'Chả giò giòn rụm', image: null },
                        { id: 'a3', name: 'Salad trộn', price: 65000, description: 'Rau củ tươi với sốt mè rang', image: null }
                    ],
                    main: [
                        { id: 'm1', name: 'Phở bò', price: 75000, description: 'Phở bò tái nạm gầu', image: null },
                        { id: 'm2', name: 'Cơm tấm sườn', price: 65000, description: 'Cơm tấm sườn bì chả', image: null },
                        { id: 'm3', name: 'Bún chả', price: 70000, description: 'Bún chả Hà Nội', image: null }
                    ],
                    seafood: [
                        { id: 's1', name: 'Tôm hùm nướng', price: 450000, description: 'Tôm hùm nướng bơ tỏi', image: null },
                        { id: 's2', name: 'Cua rang me', price: 350000, description: 'Cua biển rang me', image: null },
                        { id: 's3', name: 'Mực xào sa tế', price: 180000, description: 'Mực ống xào sa tế', image: null }
                    ],
                    drinks: [
                        { id: 'd1', name: 'Trà đá', price: 5000, description: 'Trà đá miễn phí', image: null },
                        { id: 'd2', name: 'Coca Cola', price: 20000, description: 'Coca Cola lon 330ml', image: null },
                        { id: 'd3', name: 'Sinh tố bơ', price: 35000, description: 'Sinh tố bơ sữa', image: null }
                    ],
                    desserts: [
                        { id: 'de1', name: 'Chè ba màu', price: 25000, description: 'Chè ba màu đá bào', image: null },
                        { id: 'de2', name: 'Bánh flan', price: 20000, description: 'Bánh flan caramen', image: null }
                    ]
                }
            }
        });
    } catch (error) {
        console.error('Error getting menu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

/**
 * POST /api/menu/:tableId/order - Đặt món (placeholder)
 */
router.post('/:tableId/order', async (req, res) => {
    try {
        const { tableId } = req.params;
        const { items } = req.body;

        // Validate table
        const table = await Table.findById(tableId);
        if (!table || table.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Bàn không khả dụng'
            });
        }

        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất một món'
            });
        }

        // TODO: Save order to database
        // For now, just return success
        res.status(201).json({
            success: true,
            message: 'Đặt món thành công! Nhân viên sẽ phục vụ sớm nhất.',
            data: {
                order_id: 'ORD' + Date.now(),
                table_number: table.table_number,
                items: items,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

export default router;
