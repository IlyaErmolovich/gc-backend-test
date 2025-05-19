const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  // Принимаем только изображения
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения!'), false);
  }
};

// Настройка хранилища для обложек игр
const gameCoversStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'game-covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }], // Ограничиваем размер
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = file.originalname.split('.')[0];
      return `${fileName}-${uniqueSuffix}`;
    }
  }
});

// Настройка хранилища для аватарок пользователей
const userAvatarsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }], // Обрезка для аватаров
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = file.originalname.split('.')[0];
      return `avatar-${fileName}-${uniqueSuffix}`;
    }
  }
});

// Настройка загрузки обложек игр
const uploadGameCover = multer({
  storage: gameCoversStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Настройка загрузки аватарок пользователей
const uploadUserAvatar = multer({
  storage: userAvatarsStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = {
  uploadGameCover: uploadGameCover.single('cover_image'),
  uploadUserAvatar: uploadUserAvatar.single('avatar')
}; 