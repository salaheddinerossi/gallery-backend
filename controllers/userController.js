// controllers/userController.js
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = require('../config.json').MY_SECRET_KEY;


function register(req, res) {
    const { username, password } = req.body;

    User.createUser(username, password, (error, userId) => {
        if (error) {
            return res.status(500).json({ message: 'Registration failed' });
        }

        res.status(201).json({ message: 'Registration successful' });
    });
}


function login(req, res) {
    const { username, password } = req.body;

    User.getUserByUserName(username, (error, user) => {
        if (error || !user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        console.log(user)

        if (user.password === password) {
            const token = jwt.sign({ username: user.username, userId: user.id }, secretKey,{expiresIn: '30d' });
            res.json({ message: 'Authentication successful', token: token,username:user.username });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    });
}

module.exports = { register, login };
