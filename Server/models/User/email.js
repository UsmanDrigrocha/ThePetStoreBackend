const mongoose = require('mongoose');


const emailSchema = new mongoose.Schema({
    email: { type: String, unique: true }
}, { timestamps: true });


module.exports = mongoose.model('Email_Subscribers', emailSchema);