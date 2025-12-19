import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from '../models/Table.js';

dotenv.config();

/**
 * Script to clear all tables from database
 * Run: node src/config/clearDb.js
 */
const clearDatabase = async () => {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count existing tables
        const existingCount = await Table.countDocuments();
        console.log(`📋 Found ${existingCount} existing tables`);

        if (existingCount === 0) {
            console.log('✨ Database is already empty!');
            process.exit(0);
        }

        // Ask for confirmation
        console.log('⚠️  WARNING: This will delete ALL tables from the database!');
        console.log('🗑️  Deleting all tables...');

        // Delete all tables
        const result = await Table.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} tables`);

        console.log('🎉 Database cleared successfully!');
        console.log('💡 You can now run: npm run db:seed');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database clearing failed:', error);
        process.exit(1);
    }
};

clearDatabase();
