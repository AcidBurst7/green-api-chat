import React, { useState, useEffect, useRef, FC, FormEvent } from 'react';
import { Message } from '../types/chat';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  activeChatId: string;
  messages: Message[];
  isMobileHidden: boolean;
  onBackToList: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: FC<ChatWindowProps> = ({
  activeChatId,
  messages,
  isMobileHidden,
  onBackToList,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChatId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatPhone = (chatId: string) => {
    const raw = chatId.replace('@c.us', '');
    return raw.length === 11 ? `+${raw[0]} (${raw.slice(1, 4)}) ${raw.slice(4, 7)}-${raw.slice(7, 9)}-${raw.slice(9)}` : `+${raw}`;
  };

  const currentChatMessages = messages.filter((m) => m.chatId === activeChatId);

  return (
    <main className={`chat-window ${isMobileHidden ? 'hide-mobile' : ''}`}>
      {activeChatId ? (
        <>
          <header className="chat-header">
            <button className="btn-back-mobile" onClick={onBackToList}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div className="chat-header-avatar">{activeChatId.slice(0, 2)}</div>
            <div className="chat-header-info">
              <h4>{formatPhone(activeChatId)}</h4>
              <span className="online-indicator">онлайн в MAX</span>
            </div>
          </header>

          <div className="messages-area">
            {currentChatMessages.length === 0 ? (
              <div className="chat-start-notice">Напишите первое сообщение, чтобы начать диалог</div>
            ) : (
              currentChatMessages.map((msg) => <MessageItem key={msg.id} message={msg} />)
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-footer" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Напишите сообщение..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" disabled={!inputText.trim()} className="btn-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Выберите или создайте чат</h3>
          <p>Укажите номер телефона получателя в левом меню, чтобы переписываться через GREEN-API.</p>
        </div>
      )}
    </main>
  );
};
