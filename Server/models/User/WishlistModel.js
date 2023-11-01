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
        ref: 'registeredUsers',
    },
});


module.exports = mongoose.model('wishlistmodel', wishistSchema);