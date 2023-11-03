const mongoose = require('mongoose');

const wishistSchema = new mongoose.Schema({
    wishlist: [{
        productID: {
            type: mongoose.Schema.Types.ObjectID,
            ref: 'Product',
        },
    }],
    userID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'users',
    },
});


module.exports = mongoose.model('wishlist', wishistSchema);