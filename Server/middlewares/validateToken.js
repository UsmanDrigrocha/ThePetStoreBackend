const jwt = require('jsonwebtoken');
require('dotenv').config();
const session = require('express-session');


const validateToken = async (req, res, next) => {
    try {
        const userToken = req.session.token; // Get the token from the session
        const clientToken = req.headers.authorization.split('Bearer ')[1];

        if (!userToken || userToken !== clientToken) {
            return res.status(401).send('Unauthorized');
        }
        next();
    } catch (error) {
        res.status(400).json({ message: "Error Validating Token", error: error.message });
    }
};


module.exports = {
    validateToken
}