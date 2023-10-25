const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    name: String,         // An optional name or title for the image
    description: String,  // An optional description for the image
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('imgBanners', imgSchema);
