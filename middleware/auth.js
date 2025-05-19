const jwt = require('jsonwebtoken');
require('dotenv').config();

// Захардкоженный секретный ключ (не использовать в реальных проектах!)
const JWT_SECRET = 'super_простой_секретный_ключ_1234567890';

// Middleware для проверки токена
const authMiddleware = (req, res, next) => {
  // Получаем токен из заголовка
  const token = req.header('x-auth-token');

  // Проверяем наличие токена
  if (!token) {
    return res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
  }

  try {
    // Верифицируем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Добавляем пользователя в объект запроса
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Токен недействителен' });
  }
};

// Middleware для проверки роли администратора
const adminMiddleware = (req, res, next) => {
  // Сначала проверяем токен
  authMiddleware(req, res, () => {
    // Проверяем, является ли пользователь администратором
    if (req.user && req.user.role_id === 1) {
      next();
    } else {
      res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
    }
  });
};

module.exports = {
  authMiddleware,
  adminMiddleware
}; 