const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Раздача статических файлов React приложения
app.use(express.static(path.join(__dirname, '../dist')));

// Маршрут для всех остальных запросов - отдаем index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chat_app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Добавляем обработчики событий для MongoDB
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  setTimeout(() => {
    mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).catch(err => console.error('Reconnection failed:', err));
  }, 5000);
});

// Обработка ошибок сохранения
const handleSaveError = async (operation, fallback) => {
  try {
    await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    if (fallback) await fallback();
  }
};

// Схема сообщения
const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
  chatId: String
});

const Message = mongoose.model('Message', messageSchema);

// Схема чата
const chatSchema = new mongoose.Schema({
  participants: [{
    socketId: String,
    gender: String
  }],
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

const Chat = mongoose.model('Chat', chatSchema);

// Очереди поиска по полу
const searchQueues = {
  'М': [],
  'Ж': [],
  'Не важно': []
};

// Активные соединения
const activeConnections = new Map();

// Функция для подсчета пользователей
const getUsersStats = () => {
  const totalUsers = activeConnections.size;
  const searchingUsers = Object.values(searchQueues).reduce((acc, queue) => 
    acc + queue.filter(item => {
      // Проверяем, что сокет все еще подключен
      const connection = activeConnections.get(item.socket.id);
      return connection && connection.socket.connected;
    }).length
  , 0);
  return { totalUsers, searchingUsers };
};

// Функция для обновления статистики у всех клиентов
const broadcastStats = () => {
  const stats = getUsersStats();
  io.emit('users_stats', stats);
};

// Функция для очистки очередей от отключенных пользователей
const cleanupQueues = () => {
  Object.values(searchQueues).forEach(queue => {
    const initialLength = queue.length;
    // Оставляем только подключенных пользователей
    const newQueue = queue.filter(item => {
      const connection = activeConnections.get(item.socket.id);
      return connection && connection.socket.connected;
    });
    queue.length = 0; // Очищаем очередь
    queue.push(...newQueue); // Добавляем только активных пользователей
  });
  broadcastStats();
};

// Запускаем периодическую очистку очередей
setInterval(cleanupQueues, 10000);

function isAgeMatch(user1Prefs, user2Prefs) {
  return (
    user1Prefs.targetAgeRange.min <= user2Prefs.targetAgeRange.max &&
    user1Prefs.targetAgeRange.max >= user2Prefs.targetAgeRange.min
  );
}

function isGenderMatch(user1Prefs, user2Prefs) {
  return (
    (user1Prefs.targetGender === 'Не важно' || user1Prefs.targetGender === user2Prefs.myGender) &&
    (user2Prefs.targetGender === 'Не важно' || user2Prefs.targetGender === user1Prefs.myGender)
  );
}

// Поиск подходящего партнера
function findMatch(socket, preferences) {
  const userGender = preferences.myGender;
  
  // Сначала очищаем очереди от отключенных пользователей
  cleanupQueues();
  
  // Проверяем все очереди
  for (const [queueGender, queue] of Object.entries(searchQueues)) {
    for (let i = 0; i < queue.length; i++) {
      const potentialPartner = queue[i];
      
      // Проверяем, что потенциальный партнер все еще подключен
      const partnerConnection = activeConnections.get(potentialPartner.socket.id);
      if (!partnerConnection || !partnerConnection.socket.connected) {
        queue.splice(i, 1);
        i--;
        continue;
      }
      
      if (isGenderMatch(preferences, potentialPartner.preferences) &&
          isAgeMatch(preferences, potentialPartner.preferences)) {
        // Удаляем партнера из очереди
        queue.splice(i, 1);
        broadcastStats();
        return potentialPartner;
      }
    }
  }

  // Если партнер не найден, добавляем в соответствующую очередь
  searchQueues[userGender].push({ socket, preferences });
  broadcastStats();
  return null;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Добавляем соединение в активные
  activeConnections.set(socket.id, {
    socket: socket,
    partner: null,
    chat: null
  });

  // Отправляем начальную статистику
  broadcastStats();

  socket.on('start_search', async (preferences) => {
    // Удаляем пользователя из всех очередей перед новым поиском
    Object.values(searchQueues).forEach(queue => {
      const index = queue.findIndex(item => item.socket.id === socket.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    const partner = findMatch(socket, preferences);
    
    if (partner) {
      const connection = activeConnections.get(socket.id);
      const partnerConnection = activeConnections.get(partner.socket.id);
      
      // Создаем новый чат в базе данных
      const chat = new Chat({
        participants: [
          { socketId: socket.id, gender: preferences.myGender },
          { socketId: partner.socket.id, gender: partner.preferences.myGender }
        ]
      });
      await chat.save();
      
      // Обновляем информацию о соединениях
      connection.partner = partner.socket;
      connection.chat = chat;
      partnerConnection.partner = socket;
      partnerConnection.chat = chat;
      
      // Уведомляем обоих пользователей
      socket.emit('partner_found', {
        id: partner.socket.id,
        gender: partner.preferences.myGender
      });
      
      partner.socket.emit('partner_found', {
        id: socket.id,
        gender: preferences.myGender
      });

      broadcastStats();
    }
  });

  socket.on('chat_message', async (message) => {
    const connection = activeConnections.get(socket.id);
    if (connection && connection.partner && connection.chat) {
      await handleSaveError(async () => {
        const newMessage = new Message({
          text: message.text,
          sender: socket.id,
          chatId: connection.chat._id,
          timestamp: new Date()
        });
        await newMessage.save();
        
        connection.chat.messages.push(newMessage._id);
        await connection.chat.save();

        connection.partner.emit('chat_message', {
          text: message.text,
          sender: 'partner',
          timestamp: new Date().toISOString()
        });
      }, async () => {
        connection.partner.emit('chat_message', {
          text: message.text,
          sender: 'partner',
          timestamp: new Date().toISOString()
        });
      });
    }
  });

  socket.on('stop_chat', async () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      await handleSaveError(async () => {
        if (connection.chat) {
          connection.chat.endTime = new Date();
          await connection.chat.save();
        }
      });
      
      if (connection.partner) {
        const partnerConnection = activeConnections.get(connection.partner.id);
        if (partnerConnection) {
          connection.partner.emit('partner_disconnected');
          partnerConnection.partner = null;
          partnerConnection.chat = null;
        }
      }
      
      connection.partner = null;
      connection.chat = null;
      broadcastStats(); // Обновляем статистику
    }
  });

  socket.on('disconnect', async () => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      if (connection.chat) {
        connection.chat.endTime = new Date();
        await connection.chat.save();
      }
      
      if (connection.partner) {
        const partnerConnection = activeConnections.get(connection.partner.id);
        if (partnerConnection) {
          connection.partner.emit('partner_disconnected');
          partnerConnection.partner = null;
          partnerConnection.chat = null;
        }
      }
      
      // Удаляем соединение из активных
      activeConnections.delete(socket.id);
    }
    
    // Удаляем пользователя из очередей поиска
    Object.values(searchQueues).forEach(queue => {
      const index = queue.findIndex(item => item.socket.id === socket.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    });

    broadcastStats(); // Обновляем статистику при отключении
  });
});

const PORT = process.env.PORT || 9999;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 