import React, { useState, FC, FormEvent } from 'react';
import { Credentials } from '../types/chat';

interface SidebarProps {
  credentials: Credentials;
  activeChatId: string;
  isMobileHidden: boolean;
  onSelectChat: (chatId: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({ credentials, activeChatId, isMobileHidden, onSelectChat }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCreateChat = (e: FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone) {
      const chatId = `${cleanPhone}@c.us`;
      onSelectChat(chatId);
      setPhoneNumber('');
    }
  };

  const formatPhone = (chatId: string) => {
    const raw = chatId.replace('@c.us', '');
    return raw.length === 11 ? `+${raw[0]} (${raw.slice(1, 4)}) ${raw.slice(4, 7)}-${raw.slice(7, 9)}-${raw.slice(9)}` : `+${raw}`;
  };

  return (
    <aside className={`sidebar ${isMobileHidden ? 'hide-mobile' : ''}`}>
      <div className="sidebar-header">
        <div className="user-badge">
          <div className="avatar-placeholder">ID</div>
          <div className="user-info">
            <span className="user-name">GREEN-API</span>
            <span className="user-status">id: {credentials.idInstance}</span>
          </div>
        </div>
      </div>

      <div className="chat-creator">
        <h3>Новый диалог</h3>
        <form onSubmit={handleCreateChat}>
          <div className="search-input-wrapper">
            <input
              type="tel"
              placeholder="79XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <button type="submit" className="btn-add">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="chat-list">
        <div className="chat-list-title">Активные чаты</div>
        {activeChatId ? (
          <div className="chat-item active" onClick={() => onSelectChat(activeChatId)}>
            <div className="chat-avatar">{activeChatId.slice(0, 2)}</div>
            <div className="chat-details">
              <div className="chat-name">{formatPhone(activeChatId)}</div>
              <div className="chat-preview">Активный диалог</div>
            </div>
          </div>
        ) : (
          <div className="no-chats">Введите номер выше и нажмите «+»</div>
        )}
      </div>
    </aside>
  );
};
