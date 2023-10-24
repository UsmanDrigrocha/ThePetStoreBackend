const express = require('express');
const route = express.Router();
const {validateToken}=require('../middlewares/validateToken')

const {
    showBannerImg,
    showRegistedUsers,
    createCategory,
    getProductCategories,
    genereateValidityToken
} = require('../controllers/adminController');

const { imageController } = require('../controllers/uploadImg')

route.post('/upload', imageController);

route.get('/', (req, res) => {
    res.status(300).json({ message: "Wellcome Admin" });
})

route.get('/getBannerImg', validateToken,showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)
route.get('/getProductCategories', getProductCategories)

route.get('/generate-token',genereateValidityToken)
module.exports = route;