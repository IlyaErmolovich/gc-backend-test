const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Эндпоинт для очистки БД (требует админские права)
// ВАЖНО: Использовать только в среде разработки!
router.post('/clear-db', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    // Сохраняем ID текущего админа
    const adminId = req.user.id;
    
    // Начинаем транзакцию
    await db.query('START TRANSACTION');
    
    // Удаляем связи в таблицах many-to-many
    await db.query('DELETE FROM game_genres');
    await db.query('DELETE FROM game_platforms');
    
    // Удаляем отзывы
    await db.query('DELETE FROM reviews');
    
    // Удаляем все игры
    await db.query('DELETE FROM games');
    
    // Удаляем всех пользователей, кроме текущего админа
    await db.query('DELETE FROM users WHERE id != ?', [adminId]);
    
    // Сохраняем изменения
    await db.query('COMMIT');
    
    res.json({ success: true, message: 'База данных успешно очищена' });
  } catch (error) {
    // Отменяем изменения в случае ошибки
    await db.query('ROLLBACK');
    console.error('Произошла ошибка при очистке БД:', error);
    res.status(500).json({ success: false, message: 'Ошибка при очистке базы данных', error: error.message });
  }
});

module.exports = router; 