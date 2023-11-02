// middleware/authentificationMiddleware.js
const jwt = require('jsonwebtoken');
const secretKey = require('../config.json').MY_SECRET_KEY; 

function authenticateUser(req, res, next) {

    // We Get the token from the request headers or cookies
    const token = req.headers.authorization.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verification of the token
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid' });
        }

        // Attach the user object to the request
        req.user = user;
        next();
    });
}

module.exports = authenticateUser;
