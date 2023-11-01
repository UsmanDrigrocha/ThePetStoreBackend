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
    showUserCart
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
route.post('/createProfile/:id', addUserProfile) // Create User Profile Image
route.post('/updateProfile/:id', updateUserProfile) // Update User Profile Image


route.get('/getAllCategories', getProductCategories)
route.post('/uploadImage', uploadImage)
route.post('/addToWishlist/:id', addToWishlist)
route.post('/removeFromWishlist/:id', deleteWishlist)
route.get('/getUserWishlist/:id', getUserWishlist)
route.post('/addAddress/:id', addAddress)
route.get('/getUserAddresses/:id', readAddresses)
route.post('/updateUserAddresses/:id', updateUserAddresses)
route.get('/newArrivals', newArrivals)
route.post('/addToCart/:id', addToCart)
route.post('/deleteCartItem/:id', deleteCartItem)
route.post('/updateCartItem/:id', addToCart)
route.post('/validateCoupon/:id', validateCoupon)
route.get('/getUserCart/:id',showUserCart)


module.exports = route;