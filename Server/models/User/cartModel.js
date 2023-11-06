const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    cart: [{
        productID: {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }],
    userID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'users',
    },
}, { timestamps: true });


module.exports = mongoose.model('cart', cartSchema);