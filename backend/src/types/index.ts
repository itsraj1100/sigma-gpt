export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface JwtPayload {
  sub: string; // user id
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessageInput {
  role: ChatRole;
  content: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}
