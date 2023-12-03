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


async function calculeSimilarity(req, res) {
    const userId = req.user.userId;
    const imageId = req.params.imageId;
    const seuil=0.5;

    try {
        // Fetch the selected image
        const selectedImage = await new Promise((resolve, reject) => {
            Image.getImageById(imageId, userId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (!selectedImage || selectedImage.length === 0) {
            return res.status(404).json({ message: 'No images found for this ID/user combination' });
        }

        const theme_id = selectedImage.theme_id;
        const selectedImageProperties = JSON.parse(selectedImage.properties);

        // Fetch images by theme and user
        let allImages = await new Promise((resolve, reject) => {
            Image.getImagesByThemeAndUserId(theme_id, userId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (!allImages || allImages.length === 0) {
            return res.status(404).json({ message: 'No images found for this theme/user combination' });
        }


        allImages = allImages.filter(img => img.id !== selectedImage.id)

        const categoryImagesData = allImages
            .map(img => JSON.parse(img.properties));



        const postData = {
            selected_image_data: selectedImageProperties,
            category_images_data: categoryImagesData,
            weights : {
                "histogram_colors": 0.2,
                "dominant_colors": 0.2,
                "color_moments": 0.2,
                "tamura_features": 0.2,
                "gabor_descriptors": 0.2
            },
            seuil:seuil
        };

        const endpoint = 'http://127.0.0.1:5000/api/calculate_similarity';

        const flaskResponse = await axios.post(endpoint, postData);


        const similarImagesIndexes = flaskResponse.data.similar_images.map(si => si.index);
        const similarImages = allImages
            .filter((_, index) => similarImagesIndexes.includes(index))
            .map(img => ({
                id: img.id,
                image: img.image,
                userId: img.user_id,
                themeId: img.theme_id,
                image_type: img.image_type,
                scale: img.scale,
                properties: JSON.parse(img.properties) // Parse properties into JSON
            }));

        selectedImage.properties=selectedImageProperties;

        const result = {
            selected_image: selectedImage,
            similar_images: similarImages,
            seuil:seuil
        };

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Failed to process images', error: error.message });
    }
}



async function giveFeedback(req,res){
    const selected_image = req.body.comparison.selected_image;
    const similar_images = req.body.comparison.similar_images;
    let seuil = req.body.comparison.seuil;
    console.log(req.body.comparison);

    user_feedback = [];
    index=0;
    similar_images.map((img)=>{
        if(img.isRelevent){
            obj={
                index:index,
                relevance:"bon"
            }
            user_feedback.push(obj)
            index++;
        }else{
            obj={
                index:index,
                relevance:"mauvais"
            }
            user_feedback.push(obj)
            index++;

        }
    })


    const postData = {
        selected_image_data: selected_image.properties,
        category_images_data: similar_images.map((img) => img.properties),
        user_feedback:user_feedback
    };

    const endpoint = 'http://127.0.0.1:5000/api/update_weights_and_similarity';

    const flaskResponse1 = await axios.post(endpoint, postData);


    const userId = req.user.userId;
    const imageId = selected_image.id;

    try {
        // Fetch the selected image
        const selectedImage = await new Promise((resolve, reject) => {
            Image.getImageById(imageId, userId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (!selectedImage || selectedImage.length === 0) {
            return res.status(404).json({ message: 'No images found for this ID/user combination' });
        }

        const theme_id = selectedImage.theme_id;
        const selectedImageProperties = JSON.parse(selectedImage.properties);

        // Fetch images by theme and user
        let allImages = await new Promise((resolve, reject) => {
            Image.getImagesByThemeAndUserId(theme_id, userId, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });

        if (!allImages || allImages.length === 0) {
            return res.status(404).json({ message: 'No images found for this theme/user combination' });
        }

        allImages = allImages.filter(img => img.id !== selectedImage.id)

        const categoryImagesData = allImages
            .map(img => JSON.parse(img.properties));


        console.log(seuil);
        const postData1 = {
            selected_image_data: selectedImageProperties,
            category_images_data: categoryImagesData,
            weights : flaskResponse1.data.weights,
            seuil:seuil
        };

        const endpoint = 'http://127.0.0.1:5000/api/calculate_similarity';

        const flaskResponse = await axios.post(endpoint, postData1);


        const similarImagesIndexes = flaskResponse.data.similar_images.map(si => si.index);
        const similarImages = allImages
            .filter((_, index) => similarImagesIndexes.includes(index))
            .map(img => ({
                id: img.id,
                image: img.image,
                userId: img.user_id,
                themeId: img.theme_id,
                image_type: img.image_type,
                scale: img.scale,
                properties: JSON.parse(img.properties) // Parse properties into JSON
            }));

        selectedImage.properties=selectedImageProperties;

        const result = {
            selected_image: selectedImage,
            similar_images: similarImages,
            seuil:seuil
        };


        return res.status(200).json(result);

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'Failed to process images', error: error.message });
    }


}

module.exports = { uploadImage, downloadImage, deleteImage,getImagesByTheme,getImageById,updateImage,getImagePropertiesById,calculeSimilarity,giveFeedback};
