const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'registeredUsers',
    },
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});
module.exports = mongoose.model('registeredUsersOtp', userSchema);