const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { adminMiddleware } = require('../middleware/auth');
const { uploadGameCover } = require('../middleware/upload');

// Получение всех игр с фильтрацией
router.get('/', gameController.getAllGames);

// Получение всех жанров
router.get('/genres/all', gameController.getAllGenres);

// Получение всех платформ
router.get('/platforms/all', gameController.getAllPlatforms);

// Получение игры по ID
router.get('/:id', gameController.getGameById);

// Создание новой игры (только для админов)
router.post('/', adminMiddleware, uploadGameCover, gameController.createGame);

// Обновление игры (только для админов)
router.put('/:id', adminMiddleware, uploadGameCover, gameController.updateGame);

// Удаление игры (только для админов)
router.delete('/:id', adminMiddleware, gameController.deleteGame);

module.exports = router; 