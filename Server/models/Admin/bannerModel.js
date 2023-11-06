const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    image: { type: String }
}, { timestamps: true });
module.exports = mongoose.model('imgBanners', imgSchema);
