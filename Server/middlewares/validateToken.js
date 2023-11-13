const jwt = require('jsonwebtoken');
require('dotenv').config();
const session = require('express-session');
const User = require('../models/User/userModel')

const validateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split('Bearer ')[1] || req.headers.authorization;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decoded.userID;
        const tokenVersion = decoded.tokenVersion;
        const validateUser = await User.findOne({ _id: userId, isDeleted: false });


        if (tokenVersion !== validateUser.tokenVersion) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        req.user = decoded;
        next();

    } catch (error) {
        res.status(500).json({ message: "Error Validating Token", error: error.message });
    }
};


module.exports = {
    validateToken
}