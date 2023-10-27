const path = require('path')
const express = require('express');
const route = express.Router();
const { validateToken } = require('../middlewares/validateToken');
const { bannerModel } = require('../models/bannerModel')
const dotenv = require('dotenv').config();
const {
    showBannerImg,
    showRegistedUsers,
    createCategory,
    getProductCategories,
    imageController,
    readOneCategory,
    updateCategory,
    getChildCategories,
    deleteCategory
} = require('../controllers/adminController');


route.post('/uploadBannerImage', imageController);// Upload Banner Images  -- only Admin
route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)// Create Product Category -- only Admin
route.get('/getProductCategories', getProductCategories)// validation
route.get('/getOneCategory/:id', readOneCategory)
route.put('/updateCategory/:id', updateCategory);
route.get('/getChildCategories/:id', getChildCategories); // use /:id
route.delete('/deleteCategory/:id',deleteCategory)







module.exports = route;