const { validateToken } = require('../middlewares/validateToken');
const express = require('express');
const route = express.Router();
const jwt = require('jsonwebtoken');
const session = require('express-session');

const {
    userRegister,
    userLogin,
    userResetPassword,
    userChangePassword,
    verifyUserResetPassword,
    showBannerImg,
    generateOTP,
    verifyOTP,
    addUserProfile,
    uploadImage,
    addToWishlist,
    deleteWishlist,
    getUserWishlist,
    addAddress,
    readAddresses,
    updateUserAddresses,
    newArrivals,
    addToCart,
    deleteCartItem,
    validateCoupon,
    updateUserProfile,
    showUserCart,
    createCheckOUtSession,
    createOrder,
    getUserOrders,
    cancelOrder
} = require('../controllers/userControllers');

const { getProductCategories } = require('../controllers/adminController')


// Public Routes
route.post('/register', userRegister);
route.post('/login', userLogin);
route.post('/generate-otp', generateOTP); // you can also make it patch
route.post('/verify-otp', verifyOTP)
route.post('/change-password', userChangePassword); // Change Old Password ✅
route.post('/reset-password', userResetPassword); // Send link to Email
route.get('/reset-password/:id/:token', verifyUserResetPassword) //Verify Link

route.post('/createProfile', validateToken, addUserProfile) // Create User Profile Image
route.put('/updateProfile', validateToken, updateUserProfile) // Update User Profile Image
route.get('/getAllCategories', validateToken, getProductCategories)
route.post('/uploadImage',  uploadImage)
route.post('/addToWishlist/:id', validateToken, addToWishlist)
route.post('/removeFromWishlist/:id', validateToken, deleteWishlist)
route.get('/getUserWishlist', validateToken, getUserWishlist)
route.post('/addAddress', validateToken, addAddress)
route.get('/getUserAddresses', validateToken, readAddresses)
route.put('/updateUserAddresses', validateToken, updateUserAddresses)
route.get('/newArrivals', validateToken, newArrivals)
route.post('/addToCart/:id', validateToken, addToCart)
route.post('/deleteCartItem/:id', validateToken, deleteCartItem)
route.put('/updateCartItem/:id', validateToken, addToCart)
route.post('/validateCoupon/:id', validateToken, validateCoupon)
route.get('/getUserCart', validateToken, showUserCart)
route.post('/createCheckOUtSession/:id', validateToken, createCheckOUtSession)
route.post("/createOrder", validateToken, createOrder)
route.get('/getUserOrders/:id', validateToken, getUserOrders)
route.post('/cancelOrder/:productID', validateToken, cancelOrder)

module.exports = route;