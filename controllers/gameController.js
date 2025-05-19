const Game = require('../models/game');
const fs = require('fs');
const path = require('path');

// Получение всех игр с фильтрацией
exports.getAllGames = async (req, res) => {
  try {
    console.log('Запрос на получение всех игр');
    const filters = {
      title: req.query.title,
      genre: req.query.genre,
      platform: req.query.platform,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };

    const games = await Game.getAll(filters);
    console.log(`Получено ${games.length} игр`);
    res.json(games);
  } catch (error) {
    console.error('Ошибка при получении игр:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получение игры по ID
exports.getGameById = async (req, res) => {
  try {
    console.log('Запрос игры по ID:', req.params.id);
    const gameId = req.params.id;
    const game = await Game.getById(gameId);
    
    res.json(game);
  } catch (error) {
    console.error('Ошибка при получении игры:', error);
    res.status(404).json({ message: error.message });
  }
};

// Создание новой игры (только для админов)
exports.createGame = async (req, res) => {
  try {
    console.log('Запрос на создание новой игры');
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    // Проверка наличия обязательных полей
    if (!title || !developer || !publisher || !release_date) {
      return res.status(400).json({ message: 'Необходимо указать название, разработчика, издателя и дату выхода' });
    }

    let cover_image = null;
    
    // Если загружена обложка
    if (req.file) {
      console.log('Файл загружен:', req.file.filename);
      cover_image = `/uploads/${req.file.filename}`;
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
    console.error('Ошибка при создании игры:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновление игры (только для админов)
exports.updateGame = async (req, res) => {
  try {
    console.log('Запрос на обновление игры:', req.params.id);
    const gameId = req.params.id;
    const { title, developer, publisher, release_date, genres, platforms } = req.body;
    
    let cover_image = null;
    
    // Если загружена новая обложка
    if (req.file) {
      console.log('Новый файл загружен:', req.file.filename);
      cover_image = `/uploads/${req.file.filename}`;
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
    console.error('Ошибка при обновлении игры:', error);
    res.status(500).json({ message: error.message });
  }
};

// Удаление игры (только для админов)
exports.deleteGame = async (req, res) => {
  try {
    console.log('Запрос на удаление игры:', req.params.id);
    const gameId = req.params.id;
    
    // Получаем игру, чтобы удалить файл обложки
    const game = await Game.getById(gameId);
    
    // Удаляем игру из базы данных
    await Game.delete(gameId);
    
    // Если у игры была обложка, удаляем файл
    if (game.cover_image) {
      const coverPath = path.join(__dirname, '..', game.cover_image);
      console.log('Пытаюсь удалить файл:', coverPath);
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
        console.log('Файл обложки удален');
      }
    }
    
    res.json({ message: 'Игра успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении игры:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получение всех жанров
exports.getAllGenres = async (req, res) => {
  try {
    console.log('Запрос на получение всех жанров');
    const genres = await Game.getAllGenres();
    console.log(`Получено ${genres.length} жанров`);
    res.json(genres);
  } catch (error) {
    console.error('Ошибка при получении жанров:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получение всех платформ
exports.getAllPlatforms = async (req, res) => {
  try {
    console.log('Запрос на получение всех платформ');
    const platforms = await Game.getAllPlatforms();
    console.log(`Получено ${platforms.length} платформ`);
    res.json(platforms);
  } catch (error) {
    console.error('Ошибка при получении платформ:', error);
    res.status(500).json({ message: error.message });
  }
}; 