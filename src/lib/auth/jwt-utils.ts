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

// Roles de staff (tabla `roles` del backend, seed 08_roles.ts). El único rol que
// NO es staff es `user` (cliente). El back office es solo para staff, así que el
// token debe traer uno de estos role.name; cualquier otro (o ausente) se rechaza.
export const STAFF_ROLES = [
  "admin",
  "adviser",
  "support_agent",
  "dietitian",
  "sales",
  "psychologist",
] as const;

export const isStaffToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AuthToken>(token);
    return (
      typeof decoded.role === "string" &&
      (STAFF_ROLES as readonly string[]).includes(decoded.role)
    );
  } catch {
    return false;
  }
};
