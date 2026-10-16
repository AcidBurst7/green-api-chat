import axios from 'axios';
import { Credentials } from '../types/chat';

const API_HOST = 'https://api.green-api.com';

export const greenApiService = {
  async sendMessage(credentials: Credentials, chatId: string, message: string): Promise<void> {
    const url = `${API_HOST}/waInstance${credentials.idInstance}/sendMessage/${credentials.apiTokenInstance}`;
    await axios.post(url, { chatId, message });
  },

  async receiveNotification(credentials: Credentials) {
    const url = `${API_HOST}/waInstance${credentials.idInstance}/receiveNotification/${credentials.apiTokenInstance}`;
    const response = await axios.get(url);
    return response.data;
  },

  async deleteNotification(credentials: Credentials, receiptId: number): Promise<void> {
    const url = `${API_HOST}/waInstance${credentials.idInstance}/deleteNotification/${credentials.apiTokenInstance}/${receiptId}`;
    await axios.delete(url);
  }
};
