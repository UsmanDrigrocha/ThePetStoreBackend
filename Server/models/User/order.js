const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order: [{
        productID: {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Product',
        },
        quantity: {
            type: Number,
        },
        paymentStatus: { type: String, default: 'pendning' },
        orderStatus: { type: String, default: 'pending' }
    }],
    userID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'users',
    },
}, { timestamps: true });


module.exports = mongoose.model('orders', orderSchema);