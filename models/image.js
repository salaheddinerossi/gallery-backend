// models/image.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gallery',
});

connection.connect();

class Image {
    static createImage(user_id, image, theme_id, image_type, callback) {
        const query = 'INSERT INTO images (user_id, image, theme_id, image_type) VALUES (?, ?, ?, ?)';
        connection.query(query, [user_id, image, theme_id, image_type], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results.insertId);
            }
        });
    }
    static getImagesByThemeAndUserId(theme_id, user_id, callback) {
        const query = 'SELECT * FROM images WHERE theme_id = ? AND user_id = ?';
        connection.query(query, [theme_id, user_id], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }



    static getImagesByUser(userId, callback) {
        const query = 'SELECT * FROM images WHERE user_id = ?';
        connection.query(query, [userId], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    }

    static getImageById(imageId, userId, callback) {
        const query = 'SELECT * FROM images WHERE id = ? AND user_id = ?';
        connection.query(query, [imageId, userId], (error, results) => {
            if (error) {
                callback(error, null);
            } else if (results.length === 0) {
                callback(null, null);
            } else {
                callback(null, results[0]);
            }
        });
    }

    static updateImage(imageId, user_id, updatedImage, updatedThemeId, updatedImageType,updatedScale, callback) {
        const query = 'UPDATE images SET image = ?, theme_id = ?, image_type = ?,scale=? WHERE id = ? AND user_id = ?';
        connection.query(query, [updatedImage, updatedThemeId, updatedImageType,updatedScale, imageId, user_id], (error, results) => {
            if (error) {
                console.log(error);
                callback(error, null);
            } else {
                // if any rows are affected, it means the update was successful
                callback(null, results.affectedRows > 0);
            }
        });
    }

    static updateProperties(properties,imageId, user_id) {
        const query = 'UPDATE images SET properties = ? WHERE id = ? AND user_id = ?';
        connection.query(query, [properties,imageId, user_id]);
    }



    static deleteImage(imageId,userId, callback) {
        const query = 'DELETE FROM images WHERE id = ? AND user_id= ?';
        connection.query(query, [imageId,userId], (error, results) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results.affectedRows > 0);
            }
        });
    }
}

module.exports = Image;
