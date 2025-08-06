import { getAuthTokenFromCookies, getAuthTokenFromClient } from "./cookie-utils";
import { isTokenValid, decodeToken } from "./jwt-utils";
import { AuthToken } from "./types";

// Utilidades principales de autenticación
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthTokenFromCookies();
  return token ? isTokenValid(token) : false;
};

export const getCurrentUser = async (): Promise<AuthToken | null> => {
  const token = await getAuthTokenFromCookies();
  if (!token || !isTokenValid(token)) return null;

  return decodeToken(token);
};

// Utilidades para el cliente
export const getAuthToken = (): string | null => {
  return getAuthTokenFromClient();
};

// Re-exportar tipos y utilidades principales
export * from "./types";
export * from "./jwt-utils";
export * from "./cookie-utils";
