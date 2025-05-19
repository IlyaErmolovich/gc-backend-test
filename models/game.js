const db = require('../config/db');

class Game {
  // Получение всех игр
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT g.*, 
               GROUP_CONCAT(DISTINCT gen.name) AS genres, 
               GROUP_CONCAT(DISTINCT p.name) AS platforms
        FROM games g
        LEFT JOIN game_genres gg ON g.id = gg.game_id
        LEFT JOIN genres gen ON gg.genre_id = gen.id
        LEFT JOIN game_platforms gp ON g.id = gp.game_id
        LEFT JOIN platforms p ON gp.platform_id = p.id
      `;

      const queryParams = [];
      const conditions = [];

      // Добавление фильтров
      if (filters.title) {
        conditions.push('g.title LIKE ?');
        queryParams.push(`%${filters.title}%`);
      }

      if (filters.genre) {
        conditions.push('gen.name = ?');
        queryParams.push(filters.genre);
      }

      if (filters.platform) {
        conditions.push('p.name = ?');
        queryParams.push(filters.platform);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' GROUP BY g.id';

      // Сортировка
      if (filters.sort === 'newest') {
        query += ' ORDER BY g.release_date DESC';
      } else if (filters.sort === 'popular') {
        // Здесь можно добавить логику сортировки по популярности
        query += ' ORDER BY g.id DESC';
      } else {
        query += ' ORDER BY g.title';
      }

      // Пагинация
      const page = filters.page || 1;
      const limit = filters.limit || 12;
      const offset = (page - 1) * limit;
      
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(Number(limit), Number(offset));

      const [games] = await db.query(query, queryParams);

      // Преобразуем строки жанров и платформ в массивы
      return games.map(game => ({
        ...game,
        genres: game.genres ? game.genres.split(',') : [],
        platforms: game.platforms ? game.platforms.split(',') : []
      }));
    } catch (error) {
      throw error;
    }
  }

  // Получение игры по ID
  static async getById(id) {
    try {
      const [games] = await db.query(`
        SELECT g.*, 
               GROUP_CONCAT(DISTINCT gen.name) AS genres, 
               GROUP_CONCAT(DISTINCT p.name) AS platforms
        FROM games g
        LEFT JOIN game_genres gg ON g.id = gg.game_id
        LEFT JOIN genres gen ON gg.genre_id = gen.id
        LEFT JOIN game_platforms gp ON g.id = gp.game_id
        LEFT JOIN platforms p ON gp.platform_id = p.id
        WHERE g.id = ?
        GROUP BY g.id
      `, [id]);

      if (games.length === 0) {
        throw new Error('Игра не найдена');
      }

      const game = games[0];
      
      // Преобразуем строки жанров и платформ в массивы
      return {
        ...game,
        genres: game.genres ? game.genres.split(',') : [],
        platforms: game.platforms ? game.platforms.split(',') : []
      };
    } catch (error) {
      throw error;
    }
  }

  // Создание новой игры
  static async create(gameData) {
    try {
      const { title, developer, publisher, release_date, cover_image, genres, platforms } = gameData;

      // Получаем максимальный ID для создания нового
      const [maxIdResult] = await db.query('SELECT MAX(id) as maxId FROM games');
      const newId = maxIdResult[0].maxId ? maxIdResult[0].maxId + 1 : 1;

      // Создаем игру
      await db.query(
        'INSERT INTO games (id, title, developper, publisher, release_date, cover_image) VALUES (?, ?, ?, ?, ?, ?)',
        [newId, title, developer, publisher, release_date, cover_image]
      );

      // Добавляем жанры
      if (genres && genres.length > 0) {
        for (const genreName of genres) {
          // Получаем ID жанра
          const [genreResults] = await db.query('SELECT id FROM genres WHERE name = ?', [genreName]);
          
          if (genreResults.length > 0) {
            const genreId = genreResults[0].id;
            await db.query(
              'INSERT INTO game_genres (game_id, genre_id) VALUES (?, ?)',
              [newId, genreId]
            );
          }
        }
      }

      // Добавляем платформы
      if (platforms && platforms.length > 0) {
        for (const platformName of platforms) {
          // Получаем ID платформы
          const [platformResults] = await db.query('SELECT id FROM platforms WHERE name = ?', [platformName]);
          
          if (platformResults.length > 0) {
            const platformId = platformResults[0].id;
            await db.query(
              'INSERT INTO game_platforms (game_id, platform_id) VALUES (?, ?)',
              [newId, platformId]
            );
          }
        }
      }

      return await this.getById(newId);
    } catch (error) {
      throw error;
    }
  }

  // Обновление игры
  static async update(id, gameData) {
    try {
      const { title, developer, publisher, release_date, cover_image, genres, platforms } = gameData;

      // Обновляем основные данные игры
      const updateFields = [];
      const updateParams = [];

      if (title) {
        updateFields.push('title = ?');
        updateParams.push(title);
      }

      if (developer) {
        updateFields.push('developper = ?');
        updateParams.push(developer);
      }

      if (publisher) {
        updateFields.push('publisher = ?');
        updateParams.push(publisher);
      }

      if (release_date) {
        updateFields.push('release_date = ?');
        updateParams.push(release_date);
      }

      if (cover_image) {
        updateFields.push('cover_image = ?');
        updateParams.push(cover_image);
      }

      if (updateFields.length > 0) {
        updateParams.push(id);
        await db.query(
          `UPDATE games SET ${updateFields.join(', ')} WHERE id = ?`,
          updateParams
        );
      }

      // Обновляем жанры
      if (genres && genres.length > 0) {
        // Удаляем текущие жанры
        await db.query('DELETE FROM game_genres WHERE game_id = ?', [id]);

        // Добавляем новые жанры
        for (const genreName of genres) {
          const [genreResults] = await db.query('SELECT id FROM genres WHERE name = ?', [genreName]);
          
          if (genreResults.length > 0) {
            const genreId = genreResults[0].id;
            await db.query(
              'INSERT INTO game_genres (game_id, genre_id) VALUES (?, ?)',
              [id, genreId]
            );
          }
        }
      }

      // Обновляем платформы
      if (platforms && platforms.length > 0) {
        // Удаляем текущие платформы
        await db.query('DELETE FROM game_platforms WHERE game_id = ?', [id]);

        // Добавляем новые платформы
        for (const platformName of platforms) {
          const [platformResults] = await db.query('SELECT id FROM platforms WHERE name = ?', [platformName]);
          
          if (platformResults.length > 0) {
            const platformId = platformResults[0].id;
            await db.query(
              'INSERT INTO game_platforms (game_id, platform_id) VALUES (?, ?)',
              [id, platformId]
            );
          }
        }
      }

      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  // Удаление игры
  static async delete(id) {
    try {
      // Проверяем, существует ли игра
      const [games] = await db.query('SELECT * FROM games WHERE id = ?', [id]);
      
      if (games.length === 0) {
        throw new Error('Игра не найдена');
      }

      // Удаляем связанные записи
      await db.query('DELETE FROM game_genres WHERE game_id = ?', [id]);
      await db.query('DELETE FROM game_platforms WHERE game_id = ?', [id]);
      await db.query('DELETE FROM reviews WHERE game_id = ?', [id]);

      // Удаляем игру
      await db.query('DELETE FROM games WHERE id = ?', [id]);

      return { message: 'Игра успешно удалена' };
    } catch (error) {
      throw error;
    }
  }

  // Получение всех жанров
  static async getAllGenres() {
    try {
      const [genres] = await db.query('SELECT * FROM genres ORDER BY name');
      return genres;
    } catch (error) {
      throw error;
    }
  }

  // Получение всех платформ
  static async getAllPlatforms() {
    try {
      const [platforms] = await db.query('SELECT * FROM platforms ORDER BY name');
      return platforms;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Game; 