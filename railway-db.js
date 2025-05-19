const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// ВАЖНО: Разбираем строку подключения на компоненты
// Из: mysql://root:txnKkxUXMyDLutpoidLAmvlcpJmdivay@yamabiko.proxy.rlwy.net:28519/railway
const railwayConfig = {
    host: 'yamabiko.proxy.rlwy.net', // Хост без протокола
    user: 'root',
    password: 'txnKkxUXMyDLutpoidLAmvlcpJmdivay',
    database: 'railway',
    port: 28519, // Нестандартный порт из URL
    multipleStatements: true
};

// SQL для создания таблиц (без создания базы данных, т.к. она уже создана на Railway)
const createTablesSQL = `
USE \`${railwayConfig.database}\`;

CREATE TABLE IF NOT EXISTS \`roles\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`name_UNIQUE\` (\`name\` ASC)
);

CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT NOT NULL,
  \`username\` VARCHAR(45) NOT NULL,
  \`password\` TEXT NOT NULL,
  \`role_id\` INT NOT NULL,
  \`avatar\` TEXT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`username_UNIQUE\` (\`username\` ASC),
  INDEX \`role_id_idx\` (\`role_id\` ASC),
  CONSTRAINT \`fk_users_role_id\`
    FOREIGN KEY (\`role_id\`)
    REFERENCES \`roles\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS \`games\` (
  \`id\` INT NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`developper\` VARCHAR(255) NOT NULL,
  \`publisher\` VARCHAR(255) NOT NULL,
  \`release_date\` DATE NOT NULL,
  \`cover_image\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`genres\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`game_genres\` (
  \`game_id\` INT NOT NULL,
  \`genre_id\` INT NOT NULL,
  INDEX \`game_id_idx\` (\`game_id\` ASC),
  INDEX \`genre_id_idx\` (\`genre_id\` ASC),
  PRIMARY KEY (\`game_id\`, \`genre_id\`),
  CONSTRAINT \`fk_game_genres_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_game_genres_genre_id\`
    FOREIGN KEY (\`genre_id\`)
    REFERENCES \`genres\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS \`platforms\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`game_platforms\` (
  \`game_id\` INT NOT NULL,
  \`platform_id\` INT NOT NULL,
  PRIMARY KEY (\`game_id\`, \`platform_id\`),
  INDEX \`fk_platform_id_idx\` (\`platform_id\` ASC),
  CONSTRAINT \`fk_game_platforms_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_game_platforms_platform_id\`
    FOREIGN KEY (\`platform_id\`)
    REFERENCES \`platforms\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS \`reviews\` (
  \`id\` INT NOT NULL,
  \`user_id\` INT NOT NULL,
  \`game_id\` INT NOT NULL,
  \`raiting\` INT NOT NULL,
  \`review_text\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`fk_user_id_idx\` (\`user_id\` ASC),
  INDEX \`fk_game_id_idx\` (\`game_id\` ASC) INVISIBLE,
  UNIQUE INDEX \`usr_gm_dx\` (\`user_id\` ASC, \`game_id\` ASC) VISIBLE,
  CONSTRAINT \`fk_reviews_user_id\`
    FOREIGN KEY (\`user_id\`)
    REFERENCES \`users\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_reviews_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
`;

// SQL для вставки начальных данных
const insertInitialDataSQL = `
-- Вставка ролей
INSERT INTO \`roles\` (\`id\`, \`name\`) VALUES (1, 'admin');
INSERT INTO \`roles\` (\`id\`, \`name\`) VALUES (2, 'user');

-- Вставка жанров
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (1, 'Экшен');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (2, 'Визуальная новелла');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (3, 'Киберпанк');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (4, 'Зомби');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (5, 'Кооператив');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (6, 'Платформеры');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (7, 'Стратегии');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (8, 'Ролевые');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (9, 'Карточные');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (10, 'Файтинг');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (11, 'VR');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (12, 'ММО');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (13, 'Рогалик');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (14, 'Выживание');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (15, 'Песочница');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (16, 'Спортивные');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (17, 'Симуляторы');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (18, 'Шутеры');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (19, 'Хоррор');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (20, 'Инди');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (21, 'Постапокалипсис');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (22, 'Головоломки');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (23, 'Приключения');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (24, 'Гонки');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (25, 'Авиация');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (26, 'Открытый мир');
INSERT INTO \`genres\` (\`id\`, \`name\`) VALUES (27, 'Стелс');

-- Вставка платформ
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (1, 'PC');
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (2, 'PlayStation');
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (3, 'Xbox');
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (4, 'Nintendo Switch');
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (5, 'iOS');
INSERT INTO \`platforms\` (\`id\`, \`name\`) VALUES (6, 'Android');
`;

async function initializeDatabase() {
  try {
    // Создаем соединение с MySQL на Railway
    console.log('Подключение к MySQL на Railway...');
    const connection = await mysql.createConnection(railwayConfig);
    
    console.log('Соединение с MySQL на Railway установлено');
    
    // Создаем таблицы (без создания базы данных)
    console.log('Создание таблиц...');
    await connection.query(createTablesSQL);
    
    // Вставляем начальные данные
    console.log('Вставка начальных данных...');
    await connection.query(insertInitialDataSQL);
    
    // Создаем администратора
    console.log('Создание администратора...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    await connection.query(`
      INSERT INTO \`users\` (\`id\`, \`username\`, \`password\`, \`role_id\`) 
      VALUES (1, 'admin', '${hashedPassword}', 1)
    `);
    
    console.log('База данных на Railway успешно инициализирована');
    console.log('Данные для входа администратора:');
    console.log('Логин: admin');
    console.log('Пароль: admin');
    
    // Закрываем соединение
    await connection.end();
    
    console.log('Соединение с MySQL на Railway закрыто');
    
    // Настройка переменных окружения
    console.log('\nТеперь установите следующие переменные окружения в Render.com:');
    console.log(`DB_HOST=${railwayConfig.host}`);
    console.log(`DB_PORT=${railwayConfig.port}`);
    console.log(`DB_USER=${railwayConfig.user}`);
    console.log(`DB_PASSWORD=${railwayConfig.password}`);
    console.log(`DB_NAME=${railwayConfig.database}`);
    console.log('JWT_SECRET=создайте_свой_секретный_ключ');
    
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  }
}

// Проверка, заполнены ли данные подключения
if (
  railwayConfig.host === 'YOUR_RAILWAY_HOST' || 
  railwayConfig.user === 'YOUR_RAILWAY_USER' || 
  railwayConfig.password === 'YOUR_RAILWAY_PASSWORD' || 
  railwayConfig.database === 'YOUR_RAILWAY_DATABASE'
) {
  console.log('ОШИБКА: Необходимо заменить данные подключения в файле railway-db.js!');
  console.log('Заполните корректные данные из Railway для host, user, password и database.');
} else {
  // Запускаем инициализацию базы данных
  initializeDatabase();
} 