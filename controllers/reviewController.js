const Review = require('../models/review');

// Получение всех отзывов для игры
exports.getReviewsByGameId = async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const reviews = await Review.getByGameId(gameId);
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создание нового отзыва
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = req.params.gameId;
    const { rating, reviewText } = req.body;
    
    // Проверка наличия обязательных полей
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Необходимо указать рейтинг и текст отзыва' });
    }

    // Проверка корректности рейтинга
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
    }

    // Создаем отзыв
    const review = await Review.create(userId, gameId, rating, reviewText);
    
    res.status(201).json({
      message: 'Отзыв успешно создан',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление отзыва
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { rating, reviewText } = req.body;
    
    // Проверка наличия обязательных полей
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Необходимо указать рейтинг и текст отзыва' });
    }

    // Проверка корректности рейтинга
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
    }

    // Обновляем отзыв
    const review = await Review.update(reviewId, userId, rating, reviewText);
    
    res.json({
      message: 'Отзыв успешно обновлен',
      review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление отзыва
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const isAdmin = req.user.role_id === 1;
    
    // Удаляем отзыв
    await Review.delete(reviewId, userId, isAdmin);
    
    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 