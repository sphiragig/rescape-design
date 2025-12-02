
export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export enum ViewState {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  APP = 'APP',
}

export enum AppTab {
  DESIGN_STUDIO = 'DESIGN_STUDIO',
  CHAT = 'CHAT',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
}

export enum ModelId {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  IMAGE = 'gemini-2.5-flash-image',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // stored locally for demo only
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: number;
}

export interface ProjectDesign {
  id: string;
  clientId: string;
  userId: string;
  originalImage: string;
  generatedImage: string;
  prompt: string;
  timestamp: number;
}
