
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'ur' | 'ar';

// Define the User interface required by auth and profile services
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'document';
  data: string; // base64
  mimeType: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  groundingChunks?: GroundingChunk[];
  attachments?: Attachment[];
  thoughtProcess?: string[]; 
  isThinking?: boolean;
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