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
    createOffer,
    readOffers,
    updateOffer,
    deleteOffer,
    adminLogin,
    createAdmin,
    deleteAdmin,
    getAllAdmins,
    editOrderStatus
} = require('../controllers/adminController');
const { validateAdmin } = require('../middlewares/validateAdmin');
const { newArrivals } = require('../controllers/userControllers')

route.post('/adminLogin', adminLogin);
route.post('/uploadBannerImage', validateAdmin, imageController);
route.get('/getBannerImg', validateAdmin, showBannerImg);
route.get('/getRegistedUsers', validateAdmin, showRegistedUsers);
route.post('/createCatagory/:id', validateAdmin, createCategory)//
route.get('/getProductCategories', validateAdmin, getProductCategories);
route.get('/getOneCategory/:id', validateAdmin, readOneCategory)
route.put('/updateCategory/:id', validateAdmin, updateCategory);
route.get('/getChildCategories/:id', validateAdmin, getChildCategories);
route.delete('/deleteCategory/:id', validateAdmin, deleteCategory);
route.post('/createProduct', validateAdmin, createProduct);
route.get('/getAllProducts', validateAdmin, getAllProducts);
route.get('/getProductsByCategories/:id', validateAdmin, getProductsByCategories);
route.get('/getOneProduct/:id', validateAdmin, getOneProduct);
route.put('/updateProduct/:id', validateAdmin, UpdateProduct);
route.delete('/deleteProduct/:id', validateAdmin, deleteProduct);
route.post('/createOffer/:id', validateAdmin, createOffer);
route.get('/getAllOffers', validateAdmin, readOffers);
route.post('/updateOffer/:id', validateAdmin, updateOffer);
route.delete('/deleteOffer/:id', validateAdmin, deleteOffer);
route.post('/createAdmin/:id', validateAdmin, createAdmin);
route.delete('/deleteAdmin/:id', validateAdmin, deleteAdmin);
route.get('/getAllAdmins/:id', validateAdmin, getAllAdmins);

route.post('/updateOrderStatus/:id', validateAdmin, editOrderStatus)
route.get('/newArrivals', validateAdmin, newArrivals)

module.exports = route;