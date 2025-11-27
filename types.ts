
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

export interface AnalyticsData {
  name: string;
  tokens: number;
  cost: number;
  latency: number;
}