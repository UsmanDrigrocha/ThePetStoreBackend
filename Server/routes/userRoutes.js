const express = require('express');
const route = express.Router();

const {
    userRegister,
    userLogin,
    userForgetPassword,
    userResetPassword
} = require('../controllers/userControllers');

const {
    generateOTP,
    verifyOTP
} = require('../controllers/otpController')

//Public Routes
route.post('/register', userRegister);
route.post('/login', userLogin);
route.post('/generate-otp', generateOTP);
route.post('/verify-otp', verifyOTP) 
route.post('/forget-password', userForgetPassword); // Change Old Password ✅
route.post('/reset-password', userResetPassword); // Send link to Email


module.exports = route;