const Game = require('../models/game');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

// Получение всех игр с фильтрацией
exports.getAllGames = async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      genre: req.query.genre,
      platform: req.query.platform,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };

    const games = await Game.getAll(filters);
    
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение игры по ID
exports.getGameById = async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.getById(gameId);
    
    res.json(game);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Создание новой игры (только для админов)
exports.createGame = async (req, res) => {
  try {
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    // Проверка наличия обязательных полей
    if (!title || !developer || !publisher || !release_date) {
      return res.status(400).json({ message: 'Необходимо указать название, разработчика, издателя и дату выхода' });
    }

    let cover_image = null;
    
    // Если загружена обложка (Cloudinary)
    if (req.file) {
      cover_image = req.file.path; // Cloudinary возвращает URL в path
    }

    // Преобразуем строки в массивы, если они пришли в виде строк
    const gameGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const gamePlatforms = typeof platforms === 'string' ? platforms.split(',') : platforms;

    // Создаем игру
    const game = await Game.create({
      title,
      developer,
      publisher,
      release_date,
      cover_image,
      genres: gameGenres,
      platforms: gamePlatforms
    });
    
    res.status(201).json({
      message: 'Игра успешно создана',
      game
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Обновление игры (только для админов)
exports.updateGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    // Получаем текущую игру для проверки наличия старой обложки
    const currentGame = await Game.getById(gameId);
    
    let cover_image = currentGame.cover_image; // Оставляем текущую обложку, если новая не загружена
    
    // Если загружена новая обложка (Cloudinary)
    if (req.file) {
      cover_image = req.file.path; // Cloudinary возвращает URL в path
      
      // Если была старая обложка в Cloudinary, удаляем ее
      if (currentGame.cover_image && currentGame.cover_image.includes('cloudinary.com')) {
        try {
          // Извлекаем public_id из URL
          const publicId = extractPublicIdFromUrl(currentGame.cover_image);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch (err) {
          console.error('Ошибка при удалении старой обложки из Cloudinary:', err);
        }
      }
    }

    // Преобразуем строки в массивы, если они пришли в виде строк
    const gameGenres = typeof genres === 'string' ? genres.split(',') : genres;
    const gamePlatforms = typeof platforms === 'string' ? platforms.split(',') : platforms;

    // Обновляем игру
    const game = await Game.update(gameId, {
      title,
      developer,
      publisher,
      release_date,
      cover_image,
      genres: gameGenres,
      platforms: gamePlatforms
    });
    
    res.json({
      message: 'Игра успешно обновлена',
      game
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удаление игры (только для админов)
exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // Получаем игру, чтобы удалить файл обложки
    const game = await Game.getById(gameId);
    
    // Удаляем игру из базы данных
    await Game.delete(gameId);
    
    // Если у игры была обложка в Cloudinary, удаляем файл
    if (game.cover_image && game.cover_image.includes('cloudinary.com')) {
      try {
        // Извлекаем public_id из URL
        const publicId = extractPublicIdFromUrl(game.cover_image);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error('Ошибка при удалении обложки из Cloudinary:', err);
      }
    } else if (game.cover_image) {
      // Для обратной совместимости - удаляем локальный файл, если он существует
      const coverPath = path.join(__dirname, '..', game.cover_image);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }
    
    res.json({ message: 'Игра успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение всех жанров
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Game.getAllGenres();
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение всех платформ
exports.getAllPlatforms = async (req, res) => {
  try {
    const platforms = await Game.getAllPlatforms();
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Вспомогательная функция для извлечения public_id из URL Cloudinary
function extractPublicIdFromUrl(url) {
  try {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    // Получаем части URL
    const parts = url.split('/');
    
    // Ищем индекс "upload" в URL
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Получаем части после "upload" - это папка и имя файла
    const afterUpload = parts.slice(uploadIndex + 1);
    
    // Последняя часть содержит расширение, удаляем его
    const lastPart = afterUpload[afterUpload.length - 1];
    const fileNameWithoutExt = lastPart.split('.')[0];
    afterUpload[afterUpload.length - 1] = fileNameWithoutExt;
    
    // Соединяем все части для получения полного public_id
    return afterUpload.join('/');
  } catch (err) {
    console.error('Ошибка при извлечении public_id из URL:', err);
    return null;
  }
} 