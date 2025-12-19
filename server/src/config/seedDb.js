import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from '../models/Table.js';

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
            console.log('💡 To reset, delete all tables first.');
            process.exit(0);
        }

        // Seed sample tables
        const sampleTables = [
            { table_number: 'T001', capacity: 2, location: 'Indoor', status: 'Active', description: 'Small table near entrance' },
            { table_number: 'T002', capacity: 4, location: 'Indoor', status: 'Active', description: 'Medium table by window' },
            { table_number: 'T003', capacity: 4, location: 'Outdoor', status: 'Active', description: 'Outdoor seating area' },
            { table_number: 'T004', capacity: 6, location: 'Patio', status: 'Active', description: 'Large patio table' },
            { table_number: 'T005', capacity: 8, location: 'VIP Room', status: 'Active', description: 'VIP private dining' }
        ];

        await Table.insertMany(sampleTables);
        console.log('✅ Sample tables created successfully');

        console.log('🎉 Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
