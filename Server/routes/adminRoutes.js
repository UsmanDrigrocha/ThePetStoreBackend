const express = require('express');
const route = express.Router();

const {
    showBannerImg,
    showRegistedUsers,
    createCategory
} = require('../controllers/adminController');

const { imageController } = require('../controllers/uploadImg')

route.post('/upload', imageController);

route.get('/', (req, res) => {
    res.status(300).json({ message: "Wellcome Admin" });
})

route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)

module.exports = route;