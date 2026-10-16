import React, { useState, useEffect, FC } from 'react';
import { Credentials, Message, MobileView } from './types/chat';
import { greenApiService } from './services/greenApi';
import { LoginCard } from './components/LoginCard';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import './App.css';

export const App: FC = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mobileView, setMobileView] = useState<MobileView>('list');

  // Обработка авторизации
  const handleLogin = (creds: Credentials) => {
    setCredentials(creds);
  };

  // Выбор чата / создание
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileView('chat');
  };

  // Отправка сообщения
  const handleSendMessage = async (text: string) => {
    if (!credentials || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      chatId: activeChatId,
      text,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      await greenApiService.sendMessage(credentials, activeChatId, text);
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Не удалось отправить сообщение. Проверьте правильность токенов.');
    }
  };

  // Long Polling для входящих сообщений
  useEffect(() => {
    if (!credentials) return;

    let isSubscribed = true;

    const pollNotifications = async () => {
      try {
        const data = await greenApiService.receiveNotification(credentials);
        if (data) {
          const { receiptId, body } = data;

          if (
            body?.typeWebhook === 'incomingMessageReceived' &&
            body?.messageData?.typeMessage === 'textMessage'
          ) {
            const senderId: string = body.senderData?.chatId;
            const messageText: string = body.messageData?.textMessageData?.textMessage;

            if (messageText && senderId) {
              const incomingMsg: Message = {
                id: body.idMessage || Date.now(),
                chatId: senderId,
                text: messageText,
                sender: 'them',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };

              setMessages((prev) => [...prev, incomingMsg]);
            }
          }

          await greenApiService.deleteNotification(credentials, receiptId);
        }
      } catch (error) {
        console.error('Ошибка в цикле поллинга уведомлений:', error);
      }

      if (isSubscribed) {
        setTimeout(pollNotifications, 1000);
      }
    };

    pollNotifications();

    return () => {
      isSubscribed = false;
    };
  }, [credentials]);

  if (!credentials) {
    return <LoginCard onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        credentials={credentials}
        activeChatId={activeChatId}
        isMobileHidden={mobileView === 'chat'}
        onSelectChat={handleSelectChat}
      />
      <ChatWindow
        activeChatId={activeChatId}
        messages={messages}
        isMobileHidden={mobileView === 'list'}
        onBackToList={() => setMobileView('list')}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default App;
