const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profileImage: { type: String },
    addresses: [
        {
            country: {
                type: String,
                require: true
            },
            city: {
                type: String,
                require: true
            },
            district:
            {
                type: String,
                require: true
            },
            street:
            {
                type: String,
                require: true
            },
            houseNo:
            {
                type: String,
                require: true
            },
        }
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectID,
        ref: 'users',
    }
}, { timestamps: true });


module.exports = mongoose.model('userprofile', userSchema);