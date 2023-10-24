const bannerModel = require('../models/bannerModel');
const registedUsersModel = require('../models/userModel');
const productCategoryModel = require('../models/productCategoryModel');
const jwt = require('jsonwebtoken');

const showRegistedUsers = async (req, res) => {
    try {
        const data = await registedUsersModel.find({});

        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving Users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const showBannerImg = async (req, res) => {
    try {
        const data = await bannerModel.find({});

        //---- Display the data
        // data.forEach(item => {
        //     // You can access other fields here as well
        // });

        // Respond with the data in an HTTP response
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: "Enter Category Name" });
        } else {
            const newCategory = new productCategoryModel({
                name
            });
            await newCategory.save();
            res.status(200).json({ message: "Catagory Created", newCategory });
        }
    } catch (error) {
        res.status(400).json({ message: "Error in Creating Category", error: error.message })
    }
}

const getProductCategories = async (req, res) => {
    try {
        const data = await productCategoryModel.find({});
        res.status(200).json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Error Getting Product Categories', error: error.message });
    }
};

// Generate Validation Token ; used to validate api (-- Middleware)
const genereateValidityToken = async (req, res) => {
    const newToken = generateNewToken();
    function generateNewToken() {
        const secretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({}, secretKey, { expiresIn: '5m' });
        return token;
    }
    req.session.token = newToken;
    res.json({ newToken });
}




module.exports = {
    showRegistedUsers,
    showBannerImg,
    createCategory,
    getProductCategories,
    genereateValidityToken
};