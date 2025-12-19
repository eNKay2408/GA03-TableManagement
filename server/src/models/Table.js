import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Table Schema for MongoDB
 */
const tableSchema = new Schema({
    table_number: {
        type: String,  // Changed to String to support alphanumeric table numbers like T001
        required: [true, 'Table number is required'],
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        max: [20, 'Capacity cannot exceed 20']
    },
    location: {
        type: String,
        required: [true, 'Location/Zone is required'],
        enum: ['Indoor', 'Outdoor', 'Patio', 'VIP Room'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
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
tableSchema.index({ location: 1 });
tableSchema.index({ qr_token: 1 });

// Custom validation for unique table number
tableSchema.pre('save', async function(next) {
    if (this.isModified('table_number')) {
        const existingTable = await this.constructor.findOne({ 
            table_number: this.table_number,
            _id: { $ne: this._id }
        });
        if (existingTable) {
            const error = new Error('Table number must be unique');
            error.path = 'table_number';
            return next(error);
        }
    }
    next();
});

const Table = mongoose.model('Table', tableSchema);

export default Table;
