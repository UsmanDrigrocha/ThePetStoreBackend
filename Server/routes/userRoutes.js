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
route.post('/forget-password', userForgetPassword);
route.post('/reset-password', userResetPassword);


module.exports = route;