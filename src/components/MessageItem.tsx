import React, { FC } from 'react';
import { Message } from '../types/chat';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: FC<MessageItemProps> = ({ message }) => {
  return (
    <div className={`message-row ${message.sender}`}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{message.timestamp}</span>
      </div>
    </div>
  );
};
