const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { uploadUserAvatar } = require('../middleware/upload');

// Получение профиля текущего пользователя
router.get('/profile', authMiddleware, userController.getProfile);

// Получение профиля пользователя по ID
router.get('/profile/:id', userController.getProfile);

// Обновление профиля пользователя
router.put('/profile', authMiddleware, uploadUserAvatar, userController.updateProfile);

module.exports = router; 