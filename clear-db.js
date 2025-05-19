const db = require('./config/db');
require('dotenv').config();

async function clearDatabase() {
  try {
    console.log('Начинаем очистку базы данных...');
    
    // Сохраняем ID админа (предполагается, что у админа role_id = 1)
    const [adminUsers] = await db.query('SELECT id FROM users WHERE role_id = 1 LIMIT 1');
    
    if (adminUsers.length === 0) {
      console.error('Администратор не найден! Очистка отменена.');
      process.exit(1);
    }
    
    const adminId = adminUsers[0].id;
    console.log(`Найден администратор с ID: ${adminId}`);
    
    // Начинаем транзакцию
    await db.query('START TRANSACTION');
    
    // Удаляем связи в таблицах many-to-many
    await db.query('DELETE FROM game_genres');
    await db.query('DELETE FROM game_platforms');
    
    // Удаляем отзывы
    await db.query('DELETE FROM reviews');
    
    // Удаляем все игры
    await db.query('DELETE FROM games');
    
    // Удаляем всех пользователей, кроме админа
    await db.query('DELETE FROM users WHERE id != ?', [adminId]);
    
    // Сохраняем изменения
    await db.query('COMMIT');
    
    console.log('База данных успешно очищена. Сохранен только пользователь-администратор.');
    process.exit(0);
  } catch (error) {
    // Отменяем изменения в случае ошибки
    await db.query('ROLLBACK');
    console.error('Произошла ошибка при очистке БД:', error);
    process.exit(1);
  }
}

clearDatabase(); 