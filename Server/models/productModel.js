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
});

// SubCategory Schema
const subCategorySchema = new Schema({
    name: String,
    date: { type: Date, default: Date.now },
    image: String,
    Category: { type: Schema.Types.ObjectId, ref: 'Category' },
});


//Child SubCategory Schema
const childSubCategorySchema = new Schema({
    name: String,
    date: Date,
    image: String,
    parentSubCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
});


// Product Schema
const productSchema = new Schema({
    name: String,
    details: String,
    images: [String],
    price: Number,
    size: String,
    quantity: Number,
    parentChildSubCategory: { type: Schema.Types.ObjectId, ref: 'ChildSubCategory' },
});


// Create models for the schemas
const Category = mongoose.model('Category', categorySchema);
const SubCategory = mongoose.model('SubCategory', subCategorySchema);
const childSubCategory = mongoose.model('childSubCategory', childSubCategorySchema)
const Product = mongoose.model('Product', productSchema);

//Exporting 
module.exports = {
    Category,
    SubCategory,
    childSubCategory,
    Product,
};