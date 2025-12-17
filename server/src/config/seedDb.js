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
            { table_number: 1, capacity: 2, status: 'active' },
            { table_number: 2, capacity: 4, status: 'active' },
            { table_number: 3, capacity: 4, status: 'active' },
            { table_number: 4, capacity: 6, status: 'active' },
            { table_number: 5, capacity: 8, status: 'active' }
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
