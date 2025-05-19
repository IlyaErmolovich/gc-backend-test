const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

// Захардкоженный секретный ключ (не использовать в реальных проектах!)
const JWT_SECRET = 'super_простой_секретный_ключ_1234567890';

// Регистрация нового пользователя
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка наличия обязательных полей
    if (!username || !password) {
      return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль' });
    }

    // Регистрация пользователя
    const user = await User.register(username, password);

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Авторизация пользователя
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Проверка наличия обязательных полей
    if (!username || !password) {
      return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль' });
    }

    // Авторизация пользователя
    const user = await User.login(username, password);

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Авторизация успешна',
      token,
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Получение информации о текущем пользователе
exports.getMe = async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 