const path = require('path')
const express = require('express');
const route = express.Router();
const { validateToken } = require('../middlewares/validateToken');
const { bannerModel } = require('../models/bannerModel')
const dotenv = require('dotenv').config();
const {
    showBannerImg,
    showRegistedUsers,
    createCategory,
    getProductCategories,
    imageController,
    createSubCategory,
} = require('../controllers/adminController');


route.post('/upload', imageController);// Upload Banner Images  -- only Admin
route.get('/getBannerImg', showBannerImg);
route.get('/getRegistedUsers', showRegistedUsers);
route.post('/createCatagory', createCategory)// Create Product Category -- only Admin
route.get('/getProductCategories', getProductCategories)// validation
route.post('/createProductSubCategory', createSubCategory)// validation

// -------------------------------------
// ----new 
// const multer = require('multer');
// const port = process.env.PORT
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './public/uploads');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const fileExtension = path.extname(file.originalname);
//         cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
//     }
// });

// const upload = multer({ storage });

// route.post('/uploadImage', upload.single("image"), (req, res) => {
//     try {
//         const fileType = req.file.mimetype;
//         const fileName = req.file.filename;

//         // Construct the complete URL
//         const fileURL = `http://localhost:${port}/public/uploads/${fileName}`;
//         res.json({ message: "Working", fileURL });
//     } catch (error) {
//         res.status(400).json({ message: "Error Testing Img Upload" });
//     }
// });
// -----------

module.exports = route;