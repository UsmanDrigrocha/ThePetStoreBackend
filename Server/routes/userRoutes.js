const express = require('express');
const route = express.Router();

const {
    userRegister,
    userLogin,
    userResetPassword,
    userChangePassword,
    verifyUserResetPassword
} = require('../controllers/userControllers');

const {
    generateOTP,
    verifyOTP
} = require('../controllers/otpController');

const {imageController}=require('../controllers/uploadImg')

//Auth Routes
route.post('/register', userRegister);
route.post('/login', userLogin);
route.post('/generate-otp', generateOTP);
route.post('/verify-otp', verifyOTP)
route.post('/change-password', userChangePassword); // Change Old Password ✅
route.post('/reset-password', userResetPassword); // Send link to Email
route.get('/reset-password/:id/:token', verifyUserResetPassword)

route.post('/upload', imageController);

module.exports = route;