import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Order Schema for MongoDB
 * Used to check if a table has active orders before deactivating
 */
const orderSchema = new Schema({
    table_id: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'completed', 'cancelled'],
        default: 'pending'
    },
    total_amount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Index for faster lookups
orderSchema.index({ table_id: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
