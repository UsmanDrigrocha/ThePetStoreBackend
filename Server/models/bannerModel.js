const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    createdAt: { type: Date, default: Date.now },
    image: { type: String }
});
module.exports = mongoose.model('imgBanners', imgSchema);
