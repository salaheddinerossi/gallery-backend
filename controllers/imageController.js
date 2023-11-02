const Image = require('../models/image');
const fs = require('fs');
const {post} = require("axios");
const axios = require("axios");

function uploadImage(req, res) {
    const user_id = req.user.userId;
    const { image, themeId, image_type } = req.body;


    if (!image || themeId === undefined || !image_type) {
        return res.status(400).json({ message: 'Missing required data' });
    }

    Image.createImage(user_id, image, themeId, image_type, (dbError, imageId) => {
        if (dbError) {
            return res.status(500).json({ message: 'Failed to save image details to the database' });
        }
        sendImageToFlask(imageId,user_id,req.body.image);
        return res.status(201).json({ message: 'Image uploaded successfully', imageId });
    });



}

function downloadImage(req, res) {
    const imageId = req.params.imageId;

    const userId = req.user.userId;


    Image.getImageById(imageId, userId, (error, image) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to fetch image' });
        }
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        let base64Image = image.image;

        if (!base64Image) {
            return res.status(400).json({ message: 'Image data is missing or invalid' });
        }

        const prefix = 'data:image/jpeg;base64,';
        if (base64Image.startsWith(prefix)) {
            base64Image = base64Image.substring(prefix.length);
        }

        const buffer = Buffer.from(base64Image, 'base64');

        res.setHeader('Content-Disposition', `attachment; filename=image.${image.image_type.split('/')[1]}`);
        res.setHeader('Content-Type', image.image_type);
        res.send(buffer);
    });
}

function deleteImage(req, res) {
    const imageId = req.params.imageId;
    const userId = req.user.userId;

    Image.deleteImage(imageId,userId ,(error, success) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to delete image' });
        }
        if (!success) {
            return res.status(404).json({ message: 'Image not found' });
        }
        return res.status(200).json({ message: 'Image deleted successfully' });
    });
}
async function getImagesByTheme(req, res) {
    try {
        const user_id = req.user.userId;
        const theme_id = req.params.themeId;


        Image.getImagesByThemeAndUserId(theme_id, user_id, (dbError, images) => {
            if (dbError) {
                return res.status(500).json({ message: 'Failed to fetch images from the database' });
            }
            if (images.length === 0) {
                return res.status(404).json({ message: 'No images found for this theme/user combination' });
            }
            return res.status(200).json(images);
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process the request', error: error.message });
    }
}

async function getImageById(req,res){
    const userId = req.user.userId;
    const imageId = req.params.imageId;



    Image.getImageById(imageId, userId, (error, image) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to fetch images from the database' });
        }
        if (image.length === 0) {
            return res.status(404).json({ message: 'No images found for this theme/user combination' });
        }
        return res.status(200).json(image);
    });
}
async function getImagePropertiesById(req,res){
    const userId = req.user.userId;
    const imageId = req.params.imageId;



    Image.getImageById(imageId, userId, (error, image) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to fetch images from the database' });
        }
        if (image.length === 0) {
            return res.status(404).json({ message: 'No images found for this theme/user combination' });
        }
        return res.status(200).json(JSON.parse(image.properties));
    });
}

async function updateImage(req, res) {
    const userId = req.user.userId;
    const imageId = req.params.imageId;

    const updatedImage = req.body.image.image;
    const updatedThemeId = req.body.image.themeId;

    const updatedImageType = req.body.image.image_type;
    const updatedScale = req.body.image.scale;

    Image.updateImage(imageId, userId, updatedImage, updatedThemeId, updatedImageType, updatedScale,(error, success) => {
        if (error) {
            return res.status(500).json({ message: 'Failed to update image in the database' });
        }
        if (!success) {
            return res.status(404).json({ message: 'No images found for this ID/user combination or no updates were made' });
        }
        return res.status(200).json({ message: 'Image updated successfully' });
    });
}

async function sendImageToFlask(imageId, user_id,image) {

    console.log(imageId, user_id)
    const base64Image = image;

    const endpoint = 'http://127.0.0.1:5000/api/process_image_data';

    try {
        const response = await axios.post(endpoint, {
            image_base64: base64Image
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const jsonData = JSON.stringify(response.data);

        Image.updateProperties(jsonData,imageId,user_id)

    } catch (error) {
        console.error('Error sending image:', error.message);
    }
}





module.exports = { uploadImage, downloadImage, deleteImage,getImagesByTheme,getImageById,updateImage,getImagePropertiesById};
