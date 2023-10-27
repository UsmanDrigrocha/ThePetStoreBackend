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
    readOneCategory
} = require('../controllers/adminController');


route.post('/upload', imageController);// Upload Banner Images  -- only Admin
route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)// Create Product Category -- only Admin
route.get('/getProductCategories', getProductCategories)// validation
route.get('/getOneCategory/:id',readOneCategory)
module.exports = route;