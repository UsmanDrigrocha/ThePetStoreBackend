const express = require('express');
const route = express.Router();

const {
    showBannerImg
} = require('../controllers/showBannerImg');

const { imageController } = require('../controllers/uploadImg')

// ############# Auth API's #############
// route.post('/register', userRegister);
// route.post('/login', userLogin);
// route.post('/generate-otp', generateOTP);
// route.post('/verify-otp', verifyOTP)
// route.post('/change-password', userChangePassword); // Change Old Password ✅
// route.post('/reset-password', userResetPassword); // Send link to Email
// route.get('/reset-password/:id/:token', verifyUserResetPassword)

route.post('/upload', imageController);

route.get('/', (req, res) => {
    res.status(300).json({ message: "Wellcome Admin" });
})

route.get('/getBannerImg',showBannerImg)

module.exports = route;