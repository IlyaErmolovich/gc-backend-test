const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Регистрация нового пользователя
  static async register(username, password) {
    try {
      // Проверяем, существует ли пользователь с таким именем
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (existingUsers.length > 0) {
        throw new Error('Пользователь с таким именем уже существует');
      }

      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Получаем максимальный ID для создания нового
      const [maxIdResult] = await db.query('SELECT MAX(id) as maxId FROM users');
      const newId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;

      // Создаем пользователя с ролью пользователя (2)
      const [result] = await db.query(
        'INSERT INTO users (id, username, password, role_id, avatar) VALUES (?, ?, ?, ?, ?)',
        [newId, username, hashedPassword, 2, null]
      );

      return { id: newId, username, role_id: 2 };
    } catch (error) {
      throw error;
    }
  }

  // Авторизация пользователя
  static async login(username, password) {
    try {
      // Ищем пользователя по имени
      const [users] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        throw new Error('Неверное имя пользователя или пароль');
      }

      const user = users[0];

      // Проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new Error('Неверное имя пользователя или пароль');
      }

      return {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        avatar: user.avatar
      };
    } catch (error) {
      throw error;
    }
  }

  // Получение пользователя по ID
  static async getById(id) {
    try {
      const [users] = await db.query(
        'SELECT id, username, role_id, avatar FROM users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        throw new Error('Пользователь не найден');
      }

      return users[0];
    } catch (error) {
      throw error;
    }
  }

  // Обновление профиля пользователя
  static async updateProfile(id, username, avatar) {
    try {
      // Если указано новое имя пользователя, проверяем его уникальность
      if (username) {
        const [existingUsers] = await db.query(
          'SELECT * FROM users WHERE username = ? AND id != ?',
          [username, id]
        );

        if (existingUsers.length > 0) {
          throw new Error('Пользователь с таким именем уже существует');
        }

        await db.query(
          'UPDATE users SET username = ? WHERE id = ?',
          [username, id]
        );
      }

      // Если указан новый аватар, обновляем его
      if (avatar) {
        await db.query(
          'UPDATE users SET avatar = ? WHERE id = ?',
          [avatar, id]
        );
      }

      // Получаем обновленные данные пользователя
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 