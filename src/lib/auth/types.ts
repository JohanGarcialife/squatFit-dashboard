// Tipos de autenticación
export interface AuthToken {
  exp: number;
  iat: number;
  sub: string;
  email: string;
  role: string;
}

export interface User {
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    email: string;
  };
}

export interface ApiError {
  error: string;
  status?: number;
}
