// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
// });
// module.exports = mongoose.model('productcategories', categorySchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Category Schema
const categorySchema = new Schema({
    name: { type: String },
    date: { type: Date, default: Date.now },
    image: String,
    parentId: { type: String }
});


// Product Schema
const productSchema = new Schema({
    name: { type: String, required: true },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    price: Number,
    size: String, // array
    quantity: Number,
    date: { type: Date, default: Date.now },
    parentId: { type: String, required: true }, // Parent Required
    animal: { type: String, required: true },
    coupon: {
        code: { type: String },
        discountPercentage: { type: Number },
        expirationDate: { type: Date },
    },
    discountPercentage: {
        discountPercentage: { type: Number },
        discountedPrice: { type: Number },
        expirationDate: { type: Date },
    },
    offerPrice: { type: Number, default: 0 }
});


const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);


module.exports = {
    Category,
    Product,
};

// create one schema which take name , image & id of parent (optional); if it has id then it is child else it is parent ;
// make one api ; search id : then take its child