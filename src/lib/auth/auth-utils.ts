import { getAuthTokenFromClient, getAuthTokenFromStorage } from "./cookie-utils";
import { isTokenValid, decodeToken } from "./jwt-utils";
import { AuthToken } from "./types";

// Utilidades principales de autenticación (CLIENTE)
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return token ? isTokenValid(token) : false;
};

export const getCurrentUser = (): AuthToken | null => {
  const token = getAuthToken();
  if (!token || !isTokenValid(token)) return null;

  return decodeToken(token);
};

// Utilidades para el cliente
export const getAuthToken = (): string | null => {
  // Intentar obtener de cookies primero, luego de localStorage
  const cookieToken = getAuthTokenFromClient();
  if (cookieToken) return cookieToken;

  return getAuthTokenFromStorage();
};

// Re-exportar tipos y utilidades principales
export * from "./types";
export * from "./jwt-utils";
export * from "./cookie-utils";
