import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const SOCKET_SERVER = window.location.origin;
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 2000;

const socketOptions = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: RECONNECTION_ATTEMPTS,
  reconnectionDelay: RECONNECTION_DELAY,
  reconnectionDelayMax: 5000,
  timeout: 20000,
};

const ageRanges = [
  { label: '18-21 год', value: { min: 18, max: 21 } },
  { label: '22-25 лет', value: { min: 22, max: 25 } },
  { label: '26-35 лет', value: { min: 26, max: 35 } },
  { label: '36+ лет', value: { min: 36, max: 99 } }
];

const StartPage = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    myGender: '',
    targetGender: '',
    targetAgeRange: null
  });
  const [usersStats, setUsersStats] = useState({ totalUsers: 0, searchingUsers: 0 });
  const [socket, setSocket] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let reconnectTimer;
    
    const connectSocket = () => {
      if (connectionAttempts >= RECONNECTION_ATTEMPTS) {
        setConnectionError(true);
        return;
      }

      const newSocket = io(SOCKET_SERVER, socketOptions);

      newSocket.on('connect', () => {
        setConnectionError(false);
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionAttempts(prev => prev + 1);
        
        if (connectionAttempts < RECONNECTION_ATTEMPTS) {
          reconnectTimer = setTimeout(connectSocket, RECONNECTION_DELAY);
        } else {
          setConnectionError(true);
        }
      });

      newSocket.on('users_stats', (stats) => {
        setUsersStats(stats);
      });

      return () => {
        clearTimeout(reconnectTimer);
        newSocket.close();
      };
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [connectionAttempts]);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  const isFormValid = useMemo(() => (
    preferences.targetGender && preferences.targetAgeRange && preferences.myGender
  ), [preferences]);

  const handleStart = useCallback(() => {
    if (connectionError) {
      // Попробуем переподключиться при нажатии кнопки
      setConnectionAttempts(0);
      setConnectionError(false);
      return;
    }

    if (preferences.targetGender && preferences.targetAgeRange && preferences.myGender) {
      navigate('/chat', { state: { preferences } });
    }
  }, [preferences, navigate, connectionError]);

  return (
    <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center p-4">
      <div className="bg-[#2c2d31] p-8 rounded-3xl shadow-lg w-full max-w-md transform transition-all duration-500 hover:scale-[1.02]">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] bg-clip-text text-transparent">
            Анонимный Чат
          </h1>
          {connectionError ? (
            <p className="text-red-400">
              Ошибка подключения к серверу. Нажмите "Начать поиск" для повторной попытки.
            </p>
          ) : (
            <p className="text-gray-400">
              Онлайн: {usersStats.totalUsers} пользователей
            </p>
          )}
        </div>

        <div className="space-y-8">
          {/* Выбор своего пола */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Ваш пол:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['М', 'Ж'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => updatePreference('myGender', gender)}
                  className={`relative overflow-hidden py-3 px-4 rounded-xl font-medium transition-all duration-300 
                    ${preferences.myGender === gender
                      ? 'bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] text-white shadow-lg scale-105'
                      : 'bg-[#35363c] text-gray-400 hover:bg-[#3d3e44] hover:text-gray-300'
                    }`}
                >
                  {gender === 'М' ? 'Мужской' : 'Женский'}
                  {preferences.myGender === gender && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор пола собеседника */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Пол собеседника:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['М', 'Ж', 'Не важно'].map((gender) => (
                <button
                  key={gender}
                  onClick={() => updatePreference('targetGender', gender)}
                  className={`relative overflow-hidden py-3 px-4 rounded-xl font-medium transition-all duration-300
                    ${preferences.targetGender === gender
                      ? 'bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] text-white shadow-lg scale-105'
                      : 'bg-[#35363c] text-gray-400 hover:bg-[#3d3e44] hover:text-gray-300'
                    }`}
                >
                  {gender === 'М' ? 'Мужской' : gender === 'Ж' ? 'Женский' : 'Не важно'}
                  {preferences.targetGender === gender && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор возраста */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Возраст собеседника:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {ageRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => updatePreference('targetAgeRange', range.value)}
                  className={`relative overflow-hidden py-4 px-4 rounded-xl font-medium transition-all duration-300
                    ${preferences.targetAgeRange === range.value
                      ? 'bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] text-white shadow-lg scale-105'
                      : 'bg-[#35363c] text-gray-400 hover:bg-[#3d3e44] hover:text-gray-300'
                    }`}
                >
                  {range.label}
                  {preferences.targetAgeRange === range.value && (
                    <div className="absolute inset-0 bg-white/10 animate-pulse rounded-xl"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!isFormValid && !connectionError}
            className={`w-full py-4 rounded-xl text-white font-medium text-lg transition-all duration-500 transform
              ${isFormValid || connectionError
                ? 'bg-gradient-to-r from-[#4a9eff] to-[#2d7cd1] hover:opacity-90 shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                : 'bg-[#35363c] cursor-not-allowed opacity-50'
              }`}
          >
            {connectionError ? 'Переподключиться' : isFormValid ? 'Начать поиск' : 'Заполните все поля'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage; 