// models/user.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gallery',
});

connection.connect();

class User {
    static createUser(username, password, callback) {
        const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
        connection.query(query, [username, password], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results.insertId);
            }
        });
    }

    static getUserByUserName(username, callback) {
        const query = 'SELECT * FROM users WHERE username = ?';
        connection.query(query, [username], (error, results) => {
            if (error) {
                callback(error, null);
            } else if (results.length === 0) {
                callback(null, null);
            } else {
                callback(null, results[0]);
            }
        });
    }
}
module.exports = User;
