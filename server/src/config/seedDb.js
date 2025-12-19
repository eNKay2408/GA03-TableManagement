import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from '../models/Table.js';
import { generateQRToken } from '../utils/qrUtils.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if tables already exist
        const existingCount = await Table.countDocuments();
        if (existingCount > 0) {
            console.log(`📋 Found ${existingCount} existing tables. Skipping seed.`);
            console.log('💡 To reset, run: npm run db:clear');
            process.exit(0);
        }

        // Seed sample tables with QR codes
        const sampleTables = [
            { table_number: 'T001', capacity: 2, location: 'Indoor', status: 'Active', description: 'Small table near entrance' },
            { table_number: 'T002', capacity: 4, location: 'Indoor', status: 'Active', description: 'Medium table by window' },
            { table_number: 'T003', capacity: 4, location: 'Outdoor', status: 'Active', description: 'Outdoor seating area' },
            { table_number: 'T004', capacity: 6, location: 'Patio', status: 'Active', description: 'Large patio table' },
            { table_number: 'T005', capacity: 8, location: 'VIP Room', status: 'Active', description: 'VIP private dining' }
        ];

        console.log('📝 Creating tables with QR codes...');

        for (const tableData of sampleTables) {
            // Create table
            const table = await Table.create({
                ...tableData,
                restaurant_id: process.env.RESTAURANT_ID || 'rest_001'
            });

            // Generate QR code
            const qrToken = generateQRToken(table._id, table.restaurant_id);
            table.qr_token = qrToken;
            table.qr_token_created_at = new Date();
            await table.save();

            console.log(`  ✅ Created ${table.table_number} with QR code`);
        }

        console.log('🎉 Database seeding completed!');
        console.log(`📊 Total tables created: ${sampleTables.length}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
