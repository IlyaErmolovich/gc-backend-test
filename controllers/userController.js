const User = require('../models/user');
const fs = require('fs');
const path = require('path');

// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    let avatar = null;

    // Если загружен новый аватар
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    // Обновляем профиль
    const updatedUser = await User.updateProfile(userId, username, avatar);

    res.json({
      message: 'Профиль успешно обновлен',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение профиля пользователя
exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.getById(userId);

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