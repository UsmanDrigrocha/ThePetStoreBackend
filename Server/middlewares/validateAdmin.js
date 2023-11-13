const jwt = require('jsonwebtoken');
require('dotenv').config();
const session = require('express-session');


const validateAdmin = async (req, res, next) => {
    try {
        const adminToken = req.session.adminToken; // Get the token from the session
        const clientToken = req.headers.authorization.split('Bearer ')[1] || req.headers.authorization;

        if (!adminToken || adminToken !== clientToken) {
            res.status(401)
            return res.send('Unauthorized');
        }
        next();
    } catch (error) {
        res.status(400).json({ message: "Error Validating Token", error: error.message });
    }
};


module.exports = {
    validateAdmin
}