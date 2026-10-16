import React, { useState, FC, FormEvent } from 'react';
import { Credentials } from '../types/chat';

interface LoginCardProps {
  onLogin: (credentials: Credentials) => void;
}

export const LoginCard: FC<LoginCardProps> = ({ onLogin }) => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (idInstance.trim() && apiTokenInstance.trim()) {
      onLogin({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="brand-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <h2>Вход в MAX Chat</h2>
        <p className="login-subtitle">Введите учетные данные из личного кабинета GREEN-API</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>idInstance</label>
            <input
              type="text"
              placeholder="1101000000"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>apiTokenInstance</label>
            <input
              type="password"
              placeholder="7e589...a89"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Войти в диалоги</button>
        </form>
      </div>
    </div>
  );
};
