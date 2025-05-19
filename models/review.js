const db = require('../config/db');

class Review {
  // Получение всех отзывов для игры
  static async getByGameId(gameId) {
    try {
      const [reviews] = await db.query(`
        SELECT r.*, u.username, u.avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.game_id = ?
        ORDER BY r.id DESC
      `, [gameId]);

      return reviews;
    } catch (error) {
      throw error;
    }
  }

  // Создание нового отзыва
  static async create(userId, gameId, rating, reviewText) {
    try {
      // Проверяем, не оставлял ли пользователь уже отзыв для этой игры
      const [existingReviews] = await db.query(
        'SELECT * FROM reviews WHERE user_id = ? AND game_id = ?',
        [userId, gameId]
      );

      if (existingReviews.length > 0) {
        throw new Error('Вы уже оставили отзыв для этой игры');
      }

      // Получаем максимальный ID для создания нового
      const [maxIdResult] = await db.query('SELECT MAX(id) as maxId FROM reviews');
      const newId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;

      // Создаем отзыв
      await db.query(
        'INSERT INTO reviews (id, user_id, game_id, raiting, review_text) VALUES (?, ?, ?, ?, ?)',
        [newId, userId, gameId, rating, reviewText]
      );

      // Получаем созданный отзыв с данными пользователя
      const [reviews] = await db.query(`
        SELECT r.*, u.username, u.avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `, [newId]);

      return reviews[0];
    } catch (error) {
      throw error;
    }
  }

  // Обновление отзыва
  static async update(id, userId, rating, reviewText) {
    try {
      // Проверяем, существует ли отзыв и принадлежит ли он пользователю
      const [reviews] = await db.query(
        'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (reviews.length === 0) {
        throw new Error('Отзыв не найден или вы не являетесь его автором');
      }

      // Обновляем отзыв
      await db.query(
        'UPDATE reviews SET raiting = ?, review_text = ? WHERE id = ?',
        [rating, reviewText, id]
      );

      // Получаем обновленный отзыв с данными пользователя
      const [updatedReviews] = await db.query(`
        SELECT r.*, u.username, u.avatar
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `, [id]);

      return updatedReviews[0];
    } catch (error) {
      throw error;
    }
  }

  // Удаление отзыва
  static async delete(id, userId, isAdmin = false) {
    try {
      // Если пользователь не админ, проверяем, принадлежит ли отзыв пользователю
      if (!isAdmin) {
        const [reviews] = await db.query(
          'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
          [id, userId]
        );

        if (reviews.length === 0) {
          throw new Error('Отзыв не найден или вы не являетесь его автором');
        }
      } else {
        // Для админа просто проверяем существование отзыва
        const [reviews] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
        
        if (reviews.length === 0) {
          throw new Error('Отзыв не найден');
        }
      }

      // Удаляем отзыв
      await db.query('DELETE FROM reviews WHERE id = ?', [id]);

      return { message: 'Отзыв успешно удален' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Review; 