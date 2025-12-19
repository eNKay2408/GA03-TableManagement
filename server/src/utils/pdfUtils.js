import PDFDocument from 'pdfkit';
import { generateQRCodeBuffer } from './qrUtils.js';
import path from 'path';
import fs from 'fs';

/**
 * Helper để lấy đường dẫn font an toàn
 */
const getFontPath = (fontName) => {
    return path.join(process.cwd(), 'fonts', fontName);
};

/**
 * Generate PDF document for table QR code
 * @param {Object} table - Table object from database
 * @param {string} qrUrl - QR code URL
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateTableQRPDF = async (table, qrUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // --- CẤU HÌNH FONT (QUAN TRỌNG) ---
            doc.registerFont('Regular', getFontPath('Roboto-Regular.ttf'));
            doc.registerFont('Bold', getFontPath('Roboto-Bold.ttf'));
            // ----------------------------------

            // Collect PDF data in buffer
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });
            doc.on('error', reject);

            // PDF Header - Restaurant Name
            doc.fontSize(24)
               .font('Bold')
               .text(process.env.RESTAURANT_NAME || 'Smart Restaurant', {
                   align: 'center'
               });

            doc.moveDown(0.5);

            // Divider line
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();

            doc.moveDown(1);

            // Table Number
            doc.fontSize(36)
               .font('Bold')
               .fillColor('#2c3e50')
               .text(`Bàn ${table.table_number}`, { 
                   align: 'center'
               });

            doc.moveDown(0.5);

            // Table Details
            doc.fontSize(14)
               .font('Regular')
               .fillColor('#7f8c8d')
               .text(`Sức chứa: ${table.capacity} người`, {
                   align: 'center'
               });

            doc.moveDown(2);

            // QR Code Image
            const qrBuffer = await generateQRCodeBuffer(qrUrl, {
                width: 300,
                margin: 2
            });

            const qrSize = 250;
            const qrX = (doc.page.width - qrSize) / 2;
            const qrY = doc.y;

            doc.image(qrBuffer, qrX, qrY, {
                width: qrSize,
                height: qrSize,
                align: 'center'
            });

            doc.y = qrY + qrSize + 30;

            // Instructions
            doc.fontSize(18)
               .font('Bold')
               .fillColor('#e74c3c')
               .text('Quét mã để đặt món', {
                   align: 'center'
               });

            doc.moveDown(0.5);

            doc.fontSize(12)
               .font('Regular')
               .fillColor('#7f8c8d')
               .text('Scan QR code bằng camera điện thoại', {
                   align: 'center'
               })
               .text('để xem menu và đặt món trực tuyến', {
                   align: 'center'
               });

            // Footer - QR Info
            doc.moveDown(3);
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();

            doc.moveDown(0.5);
            doc.fontSize(8)
               .font('Regular')
               .fillColor('#95a5a6')
               .text(`QR Code ID: ${table._id}`, {
                   align: 'center'
               })
               .text(`Ngày tạo: ${new Date(table.qr_token_created_at || table.created_at).toLocaleString('vi-VN')}`, {
                   align: 'center'
               });

            // Finalize PDF
            doc.end();

        } catch (error) {
            if (error.code === 'ENOENT' && error.path.includes('.ttf')) {
                console.error("❌ LỖI: Không tìm thấy file font! Hãy kiểm tra folder 'fonts' và tên file.");
            }
            reject(error);
        }
    });
};

/**
 * Generate bulk PDF with multiple tables
 * @param {Array} tables - Array of table objects
 * @param {Function} generateQRUrlFn - Function to generate QR URL
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateBulkTablesPDF = async (tables, generateQRUrlFn) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            // --- ĐĂNG KÝ FONT CHO HÀM BULK ---
            doc.registerFont('Regular', getFontPath('Roboto-Regular.ttf'));
            doc.registerFont('Bold', getFontPath('Roboto-Bold.ttf'));
            // ---------------------------------

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Cover page
            doc.fontSize(28)
               .font('Bold')
               .text(process.env.RESTAURANT_NAME || 'Smart Restaurant', {
                   align: 'center'
               });

            doc.moveDown(1);
            doc.fontSize(16)
               .font('Regular')
               .text(`Bộ QR Code - ${tables.length} bàn`, {
                   align: 'center'
               });

            doc.moveDown(0.5);
            doc.fontSize(10)
               .fillColor('#7f8c8d')
               .text(`Ngày tạo: ${new Date().toLocaleString('vi-VN')}`, {
                   align: 'center'
               });

            // Generate QR for each table
            for (let i = 0; i < tables.length; i++) {
                const table = tables[i];
                const qrUrl = generateQRUrlFn(table.qr_token);

                doc.addPage();

                // Table info
                doc.fontSize(20)
                   .font('Bold')
                   .fillColor('#2c3e50')
                   .text(`Bàn ${table.table_number}`, { align: 'center' });

                doc.moveDown(0.5);
                doc.fontSize(12)
                   .font('Regular')
                   .fillColor('#7f8c8d')
                   .text(`${table.capacity} người`, { align: 'center' });

                doc.moveDown(1.5);

                // QR Code
                const qrBuffer = await generateQRCodeBuffer(qrUrl, { width: 250 });
                const qrSize = 200;
                doc.image(qrBuffer, (doc.page.width - qrSize) / 2, doc.y, {
                    width: qrSize,
                    height: qrSize
                });

                doc.moveDown(12);
                doc.fontSize(14)
                   .fillColor('#e74c3c')
                   .font('Bold')
                   .text('Quét mã để đặt món', { align: 'center' });
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};