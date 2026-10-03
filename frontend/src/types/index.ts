export interface User {
  id: string;
  name: string;
  email: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorShape {
  message: string;
  details?: unknown;
}
