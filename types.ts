
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'ur' | 'ar';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface KoroState {
  isProcessing: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  activeModel: string;
  author: string;
  theme: Theme;
  language: Language;
}

export interface ModelSpecs {
  name: string;
  version: string;
  parameters: string;
  architecture: string;
  author: string;
}
