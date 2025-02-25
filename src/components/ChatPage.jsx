import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_SERVER = window.location.origin;

const socketOptions = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState('searching');
  const [partner, setPartner] = useState(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showConfirmEndChat, setShowConfirmEndChat] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER, socketOptions);
    setSocket(newSocket);

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      if (location.state?.preferences) {
        newSocket.emit('start_search', location.state.preferences);
      } else {
        navigate('/');
      }
    });

    newSocket.on('partner_found', (partnerInfo) => {
      setPartner(partnerInfo);
      setStatus('connected');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });

    newSocket.on('chat_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('partner_disconnected', () => {
      setStatus('disconnected');
      setPartner(null);
      setShowNewChatDialog(true);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      const message = {
        text: inputMessage,
        sender: 'me',
        timestamp: new Date().toISOString()
      };
      socket.emit('chat_message', message);
      setMessages((prev) => [...prev, message]);
      setInputMessage('');
    }
  };

  const stopChat = () => {
    setShowConfirmEndChat(true);
  };

  const confirmStopChat = () => {
    if (socket) {
      socket.emit('stop_chat');
      setShowConfirmEndChat(false);
      setShowNewChatDialog(true);
    }
  };

  const cancelSearch = () => {
    if (socket) {
      socket.close();
      navigate('/');
    }
  };

  const startNewChat = () => {
    setShowNewChatDialog(false);
    setStatus('searching');
    setMessages([]);
    socket.emit('start_search', location.state?.preferences);
  };

  // Функция для определения, является ли сообщение последним от отправителя
  const isLastMessageFromSender = (index) => {
    if (index === messages.length - 1) return true;
    return messages[index].sender !== messages[index + 1]?.sender;
  };

  return (
    <div className="h-screen flex flex-col bg-[#1a1b1e]">
      {/* Header */}
      <div className="bg-[#2c2d31] text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Анонимный чат</h1>
            {status === 'connected' && (
              <p className="text-sm text-gray-400 ml-4">
                Собеседник: {partner?.gender === 'М' ? 'Мужчина' : partner?.gender === 'Ж' ? 'Женщина' : 'Не указан'}
              </p>
            )}
          </div>
          {status === 'connected' && (
            <button
              onClick={stopChat}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Завершить чат
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto p-4 overflow-hidden flex flex-col">
        {status === 'searching' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-[#4a9eff] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg text-gray-400">Поиск собеседника...</p>
              <button
                onClick={cancelSearch}
                className="px-6 py-2 bg-[#2c2d31] text-gray-300 rounded-lg hover:bg-[#35363c] transition-colors"
              >
                Отменить поиск
              </button>
            </div>
          </div>
        )}

        {status === 'connected' && (
          <>
            <div className="chat-container flex-1 relative">
              <div className="chat-messages absolute inset-0 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} items-end space-x-2 ${
                      index > 0 && messages[index - 1].sender === message.sender ? 'mt-1' : 'mt-4'
                    }`}
                  >
                    {message.sender !== 'me' && isLastMessageFromSender(index) && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#2d7cd1] flex items-center justify-center text-white text-sm flex-shrink-0 shadow-lg">
                        {partner?.gender || '?'}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.sender === 'me'
                          ? 'bg-gradient-to-r from-[#4a9eff]/10 to-[#4a9eff]/20 text-white rounded-br-sm backdrop-blur-sm'
                          : 'bg-[#2c2d31] text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-[#4a9eff]/60' : 'text-gray-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'me' && isLastMessageFromSender(index) && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4a9e] to-[#d12d7c] flex items-center justify-center text-white text-sm shadow-lg">
                        {location.state?.preferences?.myGender || '?'}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            <form onSubmit={sendMessage} className="mt-4 flex items-center gap-2 bg-[#2c2d31] p-3 rounded-2xl backdrop-blur-sm">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className="flex-1 px-4 py-2 bg-transparent focus:outline-none text-white placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  inputMessage.trim()
                    ? 'bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] text-white hover:opacity-90'
                    : 'bg-[#35363c] text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        )}

        {(status === 'disconnected' || showNewChatDialog) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#2c2d31] p-6 rounded-2xl max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                {status === 'disconnected' ? 'Собеседник покинул чат' : 'Чат завершен'}
              </h3>
              <p className="text-gray-300 mb-6">
                Хотите начать поиск нового собеседника?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={startNewChat}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] text-white rounded-xl shadow-lg hover:opacity-90 transition-all duration-200"
                >
                  Начать поиск
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 px-6 py-3 bg-[#35363c] text-white rounded-xl shadow-lg hover:bg-[#3d3e44] transition-all duration-200"
                >
                  Изменить параметры поиска
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmEndChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#2c2d31] p-6 rounded-2xl max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-4">
                Завершение чата
              </h3>
              <p className="text-gray-300 mb-6">
                Вы действительно хотите завершить чат?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmStopChat}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 rounded-xl shadow-lg hover:from-red-500/30 hover:to-red-600/30 transition-all duration-200"
                >
                  Да, завершить
                </button>
                <button
                  onClick={() => setShowConfirmEndChat(false)}
                  className="flex-1 px-6 py-3 bg-[#35363c] text-white rounded-xl shadow-lg hover:bg-[#3d3e44] transition-all duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 