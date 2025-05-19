# Бэкенд каталога игр

REST API для каталога игр с возможностью фильтрации, оценок и отзывов.

## Технологии
- Node.js
- Express.js
- MySQL
- JWT для аутентификации

## Установка
```bash
# Установка зависимостей
npm install

# Инициализация базы данных (создаст таблицы и добавит тестовые данные)
npm run init-db

# Запуск сервера в режиме разработки с hot-reload
npm run dev

# Запуск сервера
npm start
```

## Переменные окружения
Создайте файл `.env` в корне проекта:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=games_catalog
JWT_SECRET=your_secret_key
PORT=5000
```

## API Endpoints
- **Аутентификация**: `/api/auth/register`, `/api/auth/login`
- **Игры**: `/api/games`, `/api/games/:id`
- **Отзывы**: `/api/reviews`, `/api/reviews/:gameId`
- **Пользователи**: `/api/users/profile`, `/api/users/avatar`
- **Админ**: `/api/admin/games` 