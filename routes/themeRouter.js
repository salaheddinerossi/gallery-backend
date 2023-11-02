// themeRouter.js
const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authenticate = require('../middlewares/authentificationMiddleware');

router.use(authenticate);

// Route for creating a theme
router.post('/create', themeController.createTheme);
router.get('/', themeController.getThemesByUser);

// Route for updating a theme
router.put('/update/:themeId', themeController.updateTheme);

// Route for removing a theme
router.delete('/remove/:themeId', themeController.removeTheme);

module.exports = router;


