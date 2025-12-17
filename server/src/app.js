import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import tableRoutes from './routes/tableRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import menuRoutes from './routes/menuRoutes.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow all origins for testing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for test.html)
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'MongoDB'
    });
});

// API Routes
app.use('/api/tables', tableRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/menu', menuRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
  🚀 Table Management Server is running!
  
  📍 Local:    http://localhost:${PORT}
  📍 API:      http://localhost:${PORT}/api
  📍 Health:   http://localhost:${PORT}/api/health
  📍 Test UI:  http://localhost:${PORT}/test.html
  
  📋 Available Endpoints:
  
  === CRUD APIs (Ngày 1) ===
  ├── GET    /api/tables              - List all tables
  ├── GET    /api/tables/:id          - Get table by ID (includes QR image)
  ├── POST   /api/tables              - Create table (auto-generate QR)
  ├── PUT    /api/tables/:id          - Update table
  └── PATCH  /api/tables/:id/status   - Soft delete (deactivate)

  === QR Code APIs (Ngày 2) ===
  ├── POST   /api/tables/:id/regenerate-qr  - Regenerate QR (invalidate old)
  ├── GET    /api/tables/:id/qr-image       - Get QR image (PNG download)
  └── GET    /api/verify?token=xxx          - Verify QR token

  === Menu APIs (Ngày 3) ===
  ├── GET    /api/menu?token=xxx      - Verify QR & access menu
  ├── GET    /api/menu/:tableId       - Get menu for table
  └── POST   /api/menu/:tableId/order - Place order (placeholder)
  
  🔧 Environment: ${process.env.NODE_ENV || 'development'}
  🗄️  Database: MongoDB
  `);
});

export default app;
