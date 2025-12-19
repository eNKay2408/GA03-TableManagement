import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Table Schema for MongoDB
 */
const tableSchema = new Schema({
    table_number: {
        type: Number,
        required: [true, 'Table number is required'],
        unique: true,
        min: [1, 'Table number must be at least 1']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [20, 'Capacity cannot exceed 20']
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    qr_token: {
        type: String,
        default: null
    },
    qr_token_created_at: {
        type: Date,
        default: null
    },
    restaurant_id: {
        type: String,
        default: 'rest_001'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for faster lookups
tableSchema.index({ table_number: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ qr_token: 1 });

const Table = mongoose.model('Table', tableSchema);

export default Table;
