# 🎭 TandirDate - Анонимный Чат

![TandirDate Banner](https://via.placeholder.com/1200x300/17212b/ffffff?text=TandirDate+-+%D0%90%D0%BD%D0%BE%D0%BD%D0%B8%D0%BC%D0%BD%D1%8B%D0%B9+%D0%A7%D0%B0%D1%82)

[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb)](https://www.mongodb.com/)

## 📝 Описание

TandirDate - это современное веб-приложение для анонимного общения, построенное на стеке MERN (MongoDB, Express, React, Node.js). Приложение позволяет пользователям находить собеседников для общения на основе предпочтений по полу и возрасту.

### ✨ Основные возможности

- 🔒 Полностью анонимное общение
- 👥 Умный подбор собеседников по заданным критериям
- 🎨 Современный и отзывчивый интерфейс
- 💬 Мгновенный обмен сообщениями
- 📱 Адаптивный дизайн для всех устройств

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18.x или выше
- MongoDB 6.x или выше
- npm или yarn
- Git

### Установка

1. Клонируйте репозиторий:
\`\`\`bash
git clone https://github.com/scrollDynasty/tandirdate.git
cd tandirdate
\`\`\`

2. Установите зависимости:
\`\`\`bash
npm install
\`\`\`

3. Создайте файл .env в корневой директории:
\`\`\`env
MONGODB_URI=mongodb://127.0.0.1:27017/chat_app
PORT=9999
\`\`\`

### Запуск для разработки

1. Запустите MongoDB:
\`\`\`bash
mongod
\`\`\`

2. Запустите сервер:
\`\`\`bash
node server/index.js
\`\`\`

3. В отдельном терминале запустите клиент:
\`\`\`bash
npm run dev
\`\`\`

### Сборка для продакшена

1. Соберите клиентскую часть:
\`\`\`bash
npm run build
\`\`\`

2. Запустите сервер:
\`\`\`bash
node server/index.js
\`\`\`

## 🛠 Технологии

### Фронтенд
- React 18
- Vite
- Socket.IO Client
- Tailwind CSS
- React Router

### Бэкенд
- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose

## 📦 Структура проекта

\`\`\`
tandirdate/
├── src/                    # Клиентский код
│   ├── components/         # React компоненты
│   ├── assets/            # Статические ресурсы
│   └── App.jsx            # Корневой компонент
├── server/                # Серверный код
│   └── index.js          # Основной файл сервера
├── public/               # Публичные файлы
├── dist/                 # Собранное приложение
├── package.json         # Зависимости и скрипты
└── README.md            # Документация
\`\`\`

## 🤝 Вклад в проект

Мы приветствуем ваш вклад в развитие проекта! Для этого:

1. Форкните репозиторий
2. Создайте ветку для ваших изменений
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).

## 👥 Авторы

- [scrollDynasty](https://github.com/scrollDynasty)

## 🙏 Благодарности

Особая благодарность всем контрибьюторам и сообществу open-source за вдохновение и поддержку.

---

<p align="center">Made with ❤️ for anonymous communication</p>
