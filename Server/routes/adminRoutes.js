const path = require('path')
const express = require('express');
const route = express.Router();
const { validateToken } = require('../middlewares/validateToken');
const { bannerModel } = require('../models/Admin/bannerModel')
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
    deleteCategory,
    createProduct,
    getAllProducts,
    getProductsByCategories,
    getOneProduct,
    UpdateProduct,
    deleteProduct,
    createSale,
    createOffer,
    readOffers,
    updateOffer,
    deleteOffer
} = require('../controllers/adminController');


route.post('/uploadBannerImage', imageController);
route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)
route.get('/getProductCategories', getProductCategories)
route.get('/getOneCategory/:id', readOneCategory)
route.put('/updateCategory/:id', updateCategory);
route.get('/getChildCategories/:id', getChildCategories);
route.delete('/deleteCategory/:id', deleteCategory)
route.post('/createProduct', createProduct)
route.get('/getAllProducts', getAllProducts)
route.get('/getProductsByCategories/:id', getProductsByCategories)
route.get('/getOneProduct/:id', getOneProduct)
route.put('/updateProduct/:id', UpdateProduct)
route.delete('/deleteProduct/:id', deleteProduct)
// route.post('/createSale/:id', createSale) // --------
route.post('/createOffer/:id',createOffer)
route.get('/getAllOffers',readOffers)
route.post('/updateOffer/:id',updateOffer)
route.delete('/deleteOffer/:id',deleteOffer)

module.exports = route;