const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: '1111',
  multipleStatements: true
};

// SQL для создания базы данных и таблиц
const createDatabaseSQL = `
DROP SCHEMA IF EXISTS \`vdishp\`;
CREATE SCHEMA IF NOT EXISTS \`vdishp\` DEFAULT CHARACTER SET utf8;
USE \`vdishp\`;

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`roles\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`name_UNIQUE\` (\`name\` ASC)
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`users\` (
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
    REFERENCES \`vdishp\`.\`roles\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`games\` (
  \`id\` INT NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`developper\` VARCHAR(255) NOT NULL,
  \`publisher\` VARCHAR(255) NOT NULL,
  \`release_date\` DATE NOT NULL,
  \`cover_image\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`genres\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`game_genres\` (
  \`game_id\` INT NOT NULL,
  \`genre_id\` INT NOT NULL,
  INDEX \`game_id_idx\` (\`game_id\` ASC),
  INDEX \`genre_id_idx\` (\`genre_id\` ASC),
  PRIMARY KEY (\`game_id\`, \`genre_id\`),
  CONSTRAINT \`fk_game_genres_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`vdishp\`.\`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_game_genres_genre_id\`
    FOREIGN KEY (\`genre_id\`)
    REFERENCES \`vdishp\`.\`genres\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`platforms\` (
  \`id\` INT NOT NULL,
  \`name\` VARCHAR(45) NOT NULL,
  PRIMARY KEY (\`id\`)
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`game_platforms\` (
  \`game_id\` INT NOT NULL,
  \`platform_id\` INT NOT NULL,
  PRIMARY KEY (\`game_id\`, \`platform_id\`),
  INDEX \`fk_platform_id_idx\` (\`platform_id\` ASC),
  CONSTRAINT \`fk_game_platforms_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`vdishp\`.\`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_game_platforms_platform_id\`
    FOREIGN KEY (\`platform_id\`)
    REFERENCES \`vdishp\`.\`platforms\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS \`vdishp\`.\`reviews\` (
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
    REFERENCES \`vdishp\`.\`users\` (\`id\`)
    ON DELETE NO ACTION
    ON UPDATE CASCADE,
  CONSTRAINT \`fk_reviews_game_id\`
    FOREIGN KEY (\`game_id\`)
    REFERENCES \`vdishp\`.\`games\` (\`id\`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
`;

// SQL для вставки начальных данных
const insertInitialDataSQL = `
-- Вставка ролей
INSERT INTO \`vdishp\`.\`roles\` (\`id\`, \`name\`) VALUES (1, 'admin');
INSERT INTO \`vdishp\`.\`roles\` (\`id\`, \`name\`) VALUES (2, 'user');

-- Вставка жанров
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (1, 'Экшен');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (2, 'Визуальная новелла');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (3, 'Киберпанк');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (4, 'Зомби');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (5, 'Кооператив');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (6, 'Платформеры');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (7, 'Стратегии');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (8, 'Ролевые');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (9, 'Карточные');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (10, 'Файтинг');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (11, 'VR');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (12, 'ММО');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (13, 'Рогалик');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (14, 'Выживание');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (15, 'Песочница');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (16, 'Спортивные');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (17, 'Симуляторы');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (18, 'Шутеры');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (19, 'Хоррор');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (20, 'Инди');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (21, 'Постапокалипсис');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (22, 'Головоломки');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (23, 'Приключения');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (24, 'Гонки');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (25, 'Авиация');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (26, 'Открытый мир');
INSERT INTO \`vdishp\`.\`genres\` (\`id\`, \`name\`) VALUES (27, 'Стелс');

-- Вставка платформ
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (1, 'PC');
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (2, 'PlayStation');
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (3, 'Xbox');
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (4, 'Nintendo Switch');
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (5, 'iOS');
INSERT INTO \`vdishp\`.\`platforms\` (\`id\`, \`name\`) VALUES (6, 'Android');
`;

async function initializeDatabase() {
  try {
    // Создаем соединение с MySQL
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Соединение с MySQL установлено');
    
    // Создаем базу данных и таблицы
    console.log('Создание базы данных и таблиц...');
    await connection.query(createDatabaseSQL);
    
    // Вставляем начальные данные
    console.log('Вставка начальных данных...');
    await connection.query(insertInitialDataSQL);
    
    // Создаем администратора
    console.log('Создание администратора...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);
    
    await connection.query(`
      INSERT INTO \`vdishp\`.\`users\` (\`id\`, \`username\`, \`password\`, \`role_id\`) 
      VALUES (1, 'admin', '${hashedPassword}', 1)
    `);
    
    console.log('База данных успешно инициализирована');
    console.log('Данные для входа администратора:');
    console.log('Логин: admin');
    console.log('Пароль: admin');
    
    // Закрываем соединение
    await connection.end();
    
    console.log('Соединение с MySQL закрыто');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  }
}

// Запускаем инициализацию базы данных
initializeDatabase(); 