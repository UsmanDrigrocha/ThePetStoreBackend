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
    updateUserProfile
} = require('../controllers/userControllers');

const {getProductCategories}=require('../controllers/adminController')


// Public Routes
route.post('/register', userRegister);
route.post('/login', userLogin);
route.post('/generate-otp', generateOTP); // you can also make it patch
route.post('/verify-otp', verifyOTP)
route.post('/change-password', userChangePassword); // Change Old Password ✅
route.post('/reset-password', userResetPassword); // Send link to Email
route.get('/reset-password/:id/:token', verifyUserResetPassword) //Verify Link
route.post('/updateProfileImage',addUserProfile) // use :/id
route.post('/updateUserProfile',updateUserProfile) // use :/id

//protected routes
route.get('/getAllCategories',validateToken,getProductCategories)


module.exports = route;