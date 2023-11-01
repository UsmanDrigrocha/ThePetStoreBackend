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
        ref: 'registeredUsers',
    },
});


module.exports = mongoose.model('cartModel', cartSchema);