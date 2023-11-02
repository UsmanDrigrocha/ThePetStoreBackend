const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    discountPercentage: { type: Number },
    discountedPrice: { type: Number },
    expirationDate: { type: Date },
    productID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'Product',
    }
}
);
module.exports = mongoose.model('offer', offerSchema);
