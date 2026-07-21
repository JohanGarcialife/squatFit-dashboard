import { jwtDecode } from "jwt-decode";

import { AuthToken } from "./types";

// Utilidades para validación de JWT
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): AuthToken | null => {
  try {
    return jwtDecode<AuthToken>(token);
  } catch {
    return null;
  }
};
