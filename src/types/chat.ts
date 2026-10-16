export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
}

export type SenderType = 'me' | 'them';

export interface Message {
  id: number | string;
  chatId: string;
  text: string;
  sender: SenderType;
  timestamp: string;
}

export type MobileView = 'list' | 'chat';
