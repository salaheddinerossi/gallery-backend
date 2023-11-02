const express = require('express');
const authenticate = require('../middlewares/authentificationMiddleware');
const imageController = require('../controllers/imageController');
const router = express.Router();


router.use(authenticate);

router.post('/upload', imageController.uploadImage);

router.get('/:themeId', imageController.getImagesByTheme);

router.get('/image/:imageId', imageController.getImageById);

router.get('/properties/:imageId', imageController.getImagePropertiesById);

router.put('/update/:imageId', imageController.updateImage);

router.get('/download/:imageId', imageController.downloadImage);

router.delete('/delete/:imageId', imageController.deleteImage);

module.exports = router;