const { imageController } = require('../controllers/uploadImg')
const { validateToken } = require('../middlewares/validateToken');
const express = require('express');
const route = express.Router();
const jwt=require('jsonwebtoken');
const session=require('express-session');

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


route.post('/register', validateToken, userRegister);
route.post('/login', userLogin);
route.post('/generate-otp', validateToken, generateOTP);
route.post('/verify-otp', validateToken, verifyOTP)
route.post('/change-password', validateToken, userChangePassword); // Change Old Password ✅
route.post('/reset-password', validateToken, userResetPassword); // Send link to Email
route.get('/reset-password/:id/:token', validateToken, verifyUserResetPassword) //Verify Link





module.exports = route;