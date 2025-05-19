const mysql = require('mysql2');
require('dotenv').config();

// Расширенные настройки пула соединений
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'vdishp',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Увеличиваем таймауты для предотвращения ETIMEDOUT
  connectTimeout: 60000, // 60 секунд
  acquireTimeout: 60000,
  timeout: 60000
});

// Обработка ошибок пула соединений
pool.on('error', (err) => {
  console.error('Ошибка пула соединений MySQL:', err);
  // Если соединение потеряно, пытаемся пересоздать пул
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
    console.log('Попытка переподключения к базе данных...');
    // При следующем запросе пул автоматически попытается создать новое соединение
  }
});

// Функция для проверки соединения
const checkConnection = async () => {
  try {
    const promisePool = pool.promise();
    const [result] = await promisePool.query('SELECT 1');
    console.log('Проверка соединения с БД: успешно');
    return true;
  } catch (error) {
    console.error('Проверка соединения с БД: ошибка', error);
    return false;
  }
};

// Проверяем соединение при запуске
checkConnection();

// Экспортируем пул промисов
const promisePool = pool.promise();

module.exports = promisePool; 