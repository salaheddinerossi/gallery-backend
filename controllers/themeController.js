// themeController.js
const Theme = require('../models/theme'); // Import your Theme model

// Create a new theme
async function createTheme(req, res) {
    try {
        const userId = req.user.userId;
        const { name, image, description } = req.body;
        const themeId = await Theme.createTheme(name, image, description, userId);
        res.status(201).json({ themeId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create a theme', error: error.message });
    }
}

// Update an existing theme
async function updateTheme(req, res) {
    try {
        const userId = req.user.userId;
        const themeId = req.params.themeId;
        const { name, image, description } = req.body;

        const success = await Theme.updateTheme(themeId, name, image, description, userId);

        if (!success) {
            res.status(404).json({ message: 'Theme not found or not owned by the user' });
        } else {
            res.status(200).json({ message: 'Theme updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update the theme', error: error.message });
    }
}

// Remove a theme
async function removeTheme(req, res) {
    try {
        const userId = req.user.userId;
        const themeId = req.params.themeId;

        const success = await Theme.deleteTheme(themeId, userId);

        if (!success) {
            res.status(404).json({ message: 'Theme not found or not owned by the user' });
        } else {
            res.status(200).json({ message: 'Theme removed successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove the theme', error: error.message });
    }
}
async function getThemesByUser(req, res) {
    try {
        const userId = req.user.userId;

        Theme.getThemesByUserId(userId, (error, themes) => {
            if (error) {
                throw error;
            }

            if (!themes.length) {
                res.status(404).json({ message: 'No themes found for this user' });
            } else {
                res.status(200).json(themes);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve themes', error: error.message });
    }
}


module.exports = { createTheme, updateTheme, removeTheme,getThemesByUser };
