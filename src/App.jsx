import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const API_HOST = 'https://api.green-api.com';

export default function App() {
  // 1. Состояние авторизации
  const [credentials, setCredentials] = useState({ idInstance: '', apiTokenInstance: '' });
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 2. Состояние чата
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeChatId, setActiveChatId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  // Ref для автоскролла чата вниз
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Вход в систему
  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.idInstance && credentials.apiTokenInstance) {

      setIsAuthorized(true);
    }
  };

  // Создание нового чата
  const handleCreateChat = (e) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone) {
      const chatId = `${cleanPhone}@c.us`;
      setActiveChatId(chatId);
    }
  };

  // Отправка текстового сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const url = `${API_HOST}/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`;
    const payload = {
      chatId: activeChatId,
      message: inputText,
    };

    try {
      const textToSend = inputText;
      setInputText('');

      // Добавляем сообщение локально
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: textToSend, sender: 'me', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);

      await axios.post(url, payload);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  // Лонг-поллинг для получения входящих сообщений
  useEffect(() => {
    if (!isAuthorized) return;

    let isSubscribed = true;

    const receiveNotification = async () => {
      const receiveUrl = `${API_HOST}/waInstance${credentials.idInstance}/receiveNotification/${credentials.apiTokenInstance}`;

      try {
        const response = await axios.get(receiveUrl);
        if (response.data) {
          const { receiptId, body } = response.data;

          // Проверяем, что это входящее текстовое сообщение
          if (
            body?.typeWebhook === 'incomingMessageReceived' &&
            body?.messageData?.typeMessage === 'textMessage'
          ) {
            const senderId = body.senderData?.chatId;
            const messageText = body.messageData?.textMessageData?.textMessage;

            if (messageText) {
              setMessages((prev) => [
                ...prev,
                {
                  id: body.idMessage || Date.now(),
                  chatId: senderId,
                  text: messageText,
                  sender: 'them',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }
          }

          // Обязательно удаляем уведомление из очереди
          const deleteUrl = `${API_HOST}/waInstance${credentials.idInstance}/deleteNotification/${credentials.apiTokenInstance}/${receiptId}`;
          await axios.delete(deleteUrl);
        }
      } catch (error) {
        console.error('Ошибка получения уведомления:', error);
      }

      // Запускаем следующий круг поллинга
      if (isSubscribed) {
        setTimeout(receiveNotification, 1000);
      }
    };

    receiveNotification();

    return () => {
      isSubscribed = false;
    };
  }, [isAuthorized, credentials]);

  // Фильтруем сообщения для активного чата
  const currentChatMessages = messages.filter(
    (m) => m.sender === 'me' || m.chatId === activeChatId
  );

  if (!isAuthorized) {
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>Вход в GREEN-API Chat</h2>
          <input
            type="text"
            placeholder="idInstance"
            value={credentials.idInstance}
            onChange={(e) => setCredentials({ ...credentials, idInstance: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="apiTokenInstance"
            value={credentials.apiTokenInstance}
            onChange={(e) => setCredentials({ ...credentials, apiTokenInstance: e.target.value })}
            required
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Боковая панель */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Чаты</h3>
        </div>
        <form className="create-chat-form" onSubmit={handleCreateChat}>
          <input
            type="text"
            placeholder="79XXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button type="submit">Создать чат</button>
        </form>
        {activeChatId && (
          <div className="chat-list-item active">
            <span>{activeChatId.replace('@c.us', '')}</span>
          </div>
        )}
      </div>

      {/* Окно чата */}
      <div className="chat-window">
        {activeChatId ? (
          <>
            <div className="chat-header">
              <h4>Чат с: {activeChatId.replace('@c.us', '')}</h4>
            </div>
            <div className="messages-container">
              {currentChatMessages.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Введите сообщение..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit">Отправить</button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <p>Введите номер телефона слева, чтобы начать диалог</p>
          </div>
        )}
      </div>
    </div>
  );
}