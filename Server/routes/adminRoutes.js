const path = require('path')
const express = require('express');
const route = express.Router();
const { validateToken } = require('../middlewares/validateToken');
const { bannerModel } = require('../models/bannerModel')

const {
    showBannerImg,
    showRegistedUsers,
    createCategory,
    getProductCategories,
    imageController,
    createSubCategory,
} = require('../controllers/adminController');


route.post('/upload', imageController);// Upload Banner Images  -- only Admin
route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)// Create Product Category -- only Admin
route.get('/getProductCategories', getProductCategories)// validation
route.post('/createProductSubCategory', createSubCategory)// validation

// -------------------------------------

const multer = require('multer')
const upload = multer({dest:"./public/uploads"})
route.post('/uploadImage', upload.single("Image"),(req, res) => {
    try {
        res.send("Working....")
    } catch (error) {
        res.status(400).json({ message: "Error Testing Img Upload" });
    }
});

module.exports = route;