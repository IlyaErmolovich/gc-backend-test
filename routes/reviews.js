const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Получение всех отзывов для игры
router.get('/game/:gameId', reviewController.getReviewsByGameId);

// Создание нового отзыва
router.post('/game/:gameId', authMiddleware, reviewController.createReview);

// Обновление отзыва
router.put('/:id', authMiddleware, reviewController.updateReview);

// Удаление отзыва
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router; 