const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

    offerID: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'offer',
    }, 
}, { timestamps: true });


module.exports = mongoose.model('offer_notifications', notificationSchema);