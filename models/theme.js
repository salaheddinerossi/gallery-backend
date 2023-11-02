const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gallery',
});

connection.connect();

class Theme {
    static createTheme(name, image, description, userId) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO themes (name, image, description, userId) VALUES (?, ?, ?, ?)';
            connection.query(query, [name, image, description, userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }

    static getThemes(callback) {
        const query = 'SELECT * FROM themes';
        connection.query(query, (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }

    static getThemeById(themeId, callback) {
        const query = 'SELECT * FROM themes WHERE id = ?';
        connection.query(query, [themeId], (error, results) => {
            if (error) {
                callback(error, null);
            } else if (results.length === 0) {
                callback(null, null);
            } else {
                callback(null, results[0]);
            }
        });
    }

    static updateTheme(themeId, name, image, description, userId) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE themes SET name = ?, image = ?, description = ? WHERE id = ? AND userId = ?';
            connection.query(query, [name, image, description, themeId, userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }

    static deleteTheme(themeId, userId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM themes WHERE id = ? AND userId = ?';
            connection.query(query, [themeId, userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }
    static getThemesByUserId(userId, callback) {
        const query = 'SELECT * FROM themes WHERE userId = ?';

        connection.query(query, [userId], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }

}

module.exports = Theme;
