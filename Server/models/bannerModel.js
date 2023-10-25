const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    data: Buffer,      
    contentType: String,  // The content type of the image (e.g., 'image/jpeg', 'image/png')
    name: String,         // An optional name or title for the image
    description: String,  // An optional description for the image
    createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('imgBanners', imgSchema);
